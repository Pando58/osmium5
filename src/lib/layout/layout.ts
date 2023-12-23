import { err, ok, type Result } from "$lib/result/result";
import { generateId } from "$lib/utils/generateId";

export class Layout {
	panes: Record<number, PaneWrapped> = {};

	constructor() {
		this.panes[0] = this.initPane({
			root: true,
			split: false,
		});
	}

	getPane(id: number): Result<Pane, Error> {
		if (!(id in this.panes) || id === 0) {
			return err(Error(`Pane #${id} does not exist`));
		}

		return ok(this.panes[id].pane);
	}

	createPane(config: "root" | ({
		parentId: number;
	} & ({
		order: "append" | "prepend";
	} | {
		direction: "horizontal" | "vertical";
	}))): Result<0, Error> {
		if (config === "root") {
			if (1 in this.panes) {
				return err(Error("First pane already exists"));
			}

			this.panes[1] = this.initPane({
				size: 1,
				unit: "weight",
				parentId: 0,
				split: false,
			});

			for (const f of Object.values(this.panes[0].listeners.split)) {
				f({});
			}

			return ok(0);
		}

		if (config.parentId === 0 || !(config.parentId in this.panes)) {
			return err(Error(`Pane #${config.parentId} does not exist`));
		}

		const parent = this.panes[config.parentId];

		if ("root" in parent.pane) {
			return err(Error("Internal error"));
		}

		const newPaneTemplate: Pane = {
			size: 100,
			unit: "weight",
			parentId: config.parentId,
			split: false,
		};

		if ("direction" in config) {
			if (parent.pane.split) {
				return err(Error(`Pane #${config.parentId} is already split, use 'order' instead`));
			}

			if (parent.pane.parentId !== null) {
				const grandParent = this.panes[parent.pane.parentId].pane;

				if (!("root" in grandParent)) {
					if (!("direction" in grandParent)) {
						return err(Error("Internal error"));
					}

					if (grandParent.direction === config.direction) {
						return err(Error("The split direction must not be the same as the parent pane"));
					}
				}
			}

			const pane1Id = generateId(this.panes);
			this.panes[pane1Id] = this.initPane(newPaneTemplate);
			const pane2Id = generateId(this.panes);
			this.panes[pane2Id] = this.initPane(newPaneTemplate);

			parent.pane = {
				...parent.pane,
				split: true,
				childrenId: [pane1Id, pane2Id],
				direction: config.direction,
			};
		}

		if ("order" in config) {
			if (!parent.pane.split) {
				return err(Error(`Pane #${config.parentId} has not been split yet, use 'direction' instead`));
			}

			const paneId = generateId(this.panes);
			this.panes[paneId] = this.initPane(newPaneTemplate);

			parent.pane = {
				...parent.pane,
				childrenId: config.order === "append"
					? [...parent.pane.childrenId, paneId]
					: [paneId, ...parent.pane.childrenId],
			};
		}

		for (const f of Object.values(this.panes[config.parentId].listeners.split)) {
			f({});
		}

		return ok(0);
	}

	on<T extends keyof PaneEvents>(key: T, paneId: number | "root", f: (res: PaneEvents[T]) => void): Result<number, Error> {
		if (paneId !== "root" && (!(paneId in this.panes) || paneId === 0)) {
			return err(Error(`Pane #${paneId} does not exist`));
		}

		const { listeners } = this.panes[paneId === "root" ? 0 : paneId];
		const listenerId = generateId(listeners[key]);
		listeners[key][listenerId] = f;

		return ok(listenerId);
	}

	unsub(key: keyof PaneEvents, paneId: number | "root", listenerId: number): Result<0, Error> {
		if (paneId !== "root" && (!(paneId in this.panes) || paneId === 0)) {
			return err(Error(`Pane #${paneId} does not exist`));
		}

		const { listeners } = this.panes[paneId === "root" ? 0 : paneId];

		if (!(listenerId in listeners[key])) {
			return err(Error(`'${key}' listener #${listenerId} does not exist in pane #${paneId}`));
		}

		delete listeners[key][listenerId];

		return ok(0);
	}

	private initPane(pane: Pane): PaneWrapped {
		return {
			pane: { ...pane },
			listeners: {
				split: {},
				close: {},
			},
		};
	}
}

export type Pane = {
	root: true;
	split: boolean;
} | ({
	size: number;
	unit: "weight" | "pixels";
	parentId: number | null;
} & ({
	split: true;
	childrenId: number[];
	direction: "horizontal" | "vertical";
} | {
	split: false;
}));

type PaneWrapped = {
	pane: Pane;
	listeners: {
		[T in keyof PaneEvents]: Record<number, (res: PaneEvents[T]) => void>
	};
};

type PaneEvents = {
	"split": Record<string, never>;
	"close": Record<string, never>;
};
