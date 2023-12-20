import { generateId } from "$lib/utils/generateId";

export class Layout {
	panes: Record<number, PaneWrapped> = {};
	rootListeners: {
		[T in keyof RootEvents]: Record<number, (res: RootEvents[T]) => void>
	} = {
			create: {},
			destroy: {},
		};

	createPane(config: "root" | ({
		parentId: number;
	} & ({
		order: "append" | "prepend";
	} | {
		direction: "horizontal" | "vertical";
	}))): void | Error {
		if (config === "root") {
			if (Object.keys(this.panes).length > 0) {
				return Error("Remove all panes before creating the root");
			}

			this.panes[generateId(this.panes)] = this.initPane({
				size: 1,
				unit: "weight",
				parentId: null,
				split: false,
			});

			for (const f of Object.values(this.rootListeners.create)) {
				f({});
			}

			return;
		}

		const { parentId } = config;

		if (!(parentId in this.panes)) {
			return Error(`Pane #${parentId} does not exist`);
		}

		const parent = this.panes[parentId];

		const newPane: Pane = {
			size: 100,
			unit: "weight",
			parentId,
			split: false,
		};

		if ("direction" in config) {
			if (parent.pane.split) {
				return Error(`Pane #${parentId} is already split, use 'order' instead`);
			}

			if (parent.pane.parentId !== null) {
				const grandParent = this.panes[parent.pane.parentId].pane;

				if (!grandParent.split) {
					return Error("Grand parent pane is not split for some reason");
				}

				if (grandParent.direction === config.direction) {
					return Error("The split direction must not be the same as the parent pane");
				}
			}

			const newPaneId1 = generateId(this.panes);
			this.panes[newPaneId1] = this.initPane({ ...newPane });

			const newPaneId2 = generateId(this.panes);
			this.panes[newPaneId2] = this.initPane(newPane);

			parent.pane = {
				...parent.pane,
				split: true,
				childrenId: [newPaneId1, newPaneId2],
				direction: config.direction,
			};

			for (const f of Object.values(parent.listeners.split)) {
				f({});
			}

			return;
		}

		if (!parent.pane.split) {
			return Error(`Pane #${parentId} is not split, use 'direction' instead`);
		}

		const newPaneId1 = generateId(this.panes);
		this.panes[newPaneId1] = this.initPane(newPane);

		parent.pane = {
			...parent.pane,
			childrenId: config.order === "append"
				? [...parent.pane.childrenId, newPaneId1]
				: [newPaneId1, ...parent.pane.childrenId],
		};

		for (const f of Object.values(parent.listeners.split)) {
			f({});
		}

		return;
	}

	closePane(id: number): void | Error {
		if (!(id in this.panes)) {
			return Error(`Pane #${id} does not exist`);
		}

		// ...
	}

	getPane(id: number): Pane | Error {
		if (!(id in this.panes)) {
			return Error(`Pane #${id} does not exist`);
		}

		return this.panes[id].pane;
	}

	onPane<T extends keyof PaneEvents>(key: T, paneId: number, f: (res: PaneEvents[T]) => void): number | Error {
		if (!(paneId in this.panes)) {
			return Error(`Pane #${paneId} does not exist`);
		}

		const { listeners } = this.panes[paneId];
		const listenerId = generateId(listeners[key]);
		listeners[key][listenerId] = f;

		return listenerId;
	}

	unsubPane(key: keyof PaneEvents, paneId: number, listenerId: number): void | Error {
		if (!(paneId in this.panes)) {
			return Error(`Pane #${paneId} does not exist`);
		}

		const { listeners } = this.panes[paneId];

		if (!(listenerId in listeners[key])) {
			return Error(`Listener #${listenerId} does not exist`);
		}

		delete listeners[key][listenerId];

		return;
	}

	onRoot<T extends keyof RootEvents>(key: T, f: (res: RootEvents[T]) => void): number | Error {
		const listenerId = generateId(this.rootListeners[key]);
		this.rootListeners[key][listenerId] = f;

		return listenerId;
	}

	unsubRoot(key: keyof RootEvents, listenerId: number): void | Error {
		if (!(listenerId in this.rootListeners[key])) {
			return Error(`Listener #${listenerId} does not exist`);
		}

		delete this.rootListeners[key][listenerId];

		return;
	}

	private initPane(pane: Pane): PaneWrapped {
		return {
			pane: pane,
			listeners: {
				split: {},
				close: {},
			},
		};
	}
}

export type Pane = {
	size: number;
	unit: "weight" | "pixels";
	parentId: number | null;
} & ({
	split: true;
	childrenId: number[];
	direction: "horizontal" | "vertical";
} | {
	split: false;
});

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

type RootEvents = {
	"create": Record<string, never>;
	"destroy": Record<string, never>;
};
