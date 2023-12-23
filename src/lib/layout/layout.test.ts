import { describe, expect, beforeEach, it } from "vitest";
import { Layout } from "./layout";

let layout: Layout;

beforeEach(() => {
	layout = new Layout();
});

describe("layout init", () => {
	it("creates the root pane", () => {
		expect(layout.panes[0]).toBeDefined();
	});
});

describe("get pane", () => {
	it("returns a pane", () => {
		layout.createPane("root");

		expect(layout.getPane(1).isOk()).toBe(true);
	});

	it("fails to get a nonexistent pane", () => {
		expect(layout.getPane(1).isOk()).toBe(false);
	});

	it("does not work with the pane id 0 (root pane)", () => {
		expect(layout.getPane(0).isOk()).toBe(false);
	});
});

describe("create pane", () => {
	it("creates the first pane", () => {
		layout.createPane("root");

		expect(layout.getPane(1).unwrap()).toEqual(expect.objectContaining({
			parentId: 0,
			split: false,
		}));
	});

	it("fails to create the first pane twice", () => {
		layout.createPane("root");

		expect(layout.createPane("root").isOk()).toBe(false);
	});

	it("splits and creates child panes", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });

		expect(layout.getPane(1).unwrap()).toEqual(expect.objectContaining({
			split: true,
			direction: "vertical",
			childrenId: [2, 3],
		}));
		expect(layout.getPane(2).unwrap()).toEqual(expect.objectContaining({
			size: 100,
			unit: "weight",
			parentId: 1,
			split: false,
		}));
		expect(layout.getPane(3).unwrap()).toEqual(expect.objectContaining({
			size: 100,
			unit: "weight",
			parentId: 1,
			split: false,
		}));
	});

	it("fails when using pane id 0 (root pane)", () => {
		expect(layout.createPane({ parentId: 0, direction: "horizontal" }).isOk()).toBe(false);
	});

	it("fails if the given pane does not exist", () => {
		expect(layout.createPane({ parentId: 1, direction: "horizontal" }).isOk()).toBe(false);
		expect(layout.createPane({ parentId: 3.4524, direction: "horizontal" }).isOk()).toBe(false);
	});

	it("fails to split an already split pane", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		expect(layout.createPane({ parentId: 1, direction: "horizontal" }).isOk()).toBe(false);
	});

	it("fails to create a pane when the grand parent direction is the same as the parent", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		expect(layout.createPane({ parentId: 2, direction: "vertical" }).isOk()).toBe(true);
		expect(layout.createPane({ parentId: 3, direction: "horizontal" }).isOk()).toBe(false);
	});

	it("appends a pane to an already split pane", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });
		layout.createPane({ parentId: 1, order: "append" });

		expect(layout.getPane(1).unwrap()).toEqual(expect.objectContaining({
			childrenId: [2, 3, 4],
		}));
	});

	it("prepends a pane to an already split pane", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });
		layout.createPane({ parentId: 1, order: "prepend" });

		expect(layout.getPane(1).unwrap()).toEqual(expect.objectContaining({
			childrenId: [4, 2, 3],
		}));
	});

	it("fails to append a new pane if the parent has not been split yet", () => {
		layout.createPane("root");

		expect(layout.createPane({ parentId: 1, order: "append" }).isOk()).toBe(false);
	});

	it("notifies the correct panes", () => {
		let notifiedRoot = false;
		let notified2 = false;
		let notified5 = false;

		layout.on("split", "root", () => notifiedRoot = true);
		layout.createPane("root");
		expect(notifiedRoot).toBe(true);

		layout.createPane({ parentId: 1, direction: "vertical" });

		layout.on("split", 2, () => notified2 = true);
		layout.createPane({ parentId: 2, direction: "horizontal" });
		expect(notified2).toBe(true);

		layout.on("split", 5, () => notified5 = true);
		layout.createPane({ parentId: 5, direction: "vertical" });
		expect(notified5).toBe(true);

		notified2 = false;
		layout.createPane({ parentId: 2, order: "append" });
		expect(notified2).toBe(true);
	});
});

describe("event subscribing", () => {
	it("subscribes to the given pane and event", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		expect(layout.panes[2].listeners.split).toEqual({});
		expect(layout.panes[3].listeners.close).toEqual({});

		layout.on("split", 2, () => {});

		expect(layout.panes[2].listeners.split).toHaveProperty("0");
		expect(layout.panes[3].listeners.close).toEqual({});

		layout.on("close", 3, () => {});

		expect(layout.panes[2].listeners.split).toHaveProperty("0");
		expect(layout.panes[3].listeners.close).toHaveProperty("0");
	});

	it("assigns the listener ids correctly", () => {
		layout.createPane("root");

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual([]);

		layout.on("split", 1, () => {});

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0"]);

		layout.on("split", 1, () => {});

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0", "1"]);

		layout.on("split", 1, () => {});
		layout.on("split", 1, () => {});
		layout.on("split", 1, () => {});

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0", "1", "2", "3", "4"]);

		layout.unsub("split", 1, 1);
		layout.unsub("split", 1, 3);

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0", "2", "4"]);

		layout.on("split", 1, () => {});

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0", "1", "2", "4"]);

		layout.on("split", 1, () => {});

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0", "1", "2", "3", "4"]);
	});

	it("fails if the given pane does not exist", () => {
		expect(layout.on("split", 1, () => {}).isOk()).toBe(false);
	});

	it("does not work with the pane id 0 (root pane)", () => {
		expect(layout.on("split", 0, () => {}).isOk()).toBe(false);
	});

	it("works with 'root' instead of passing 0 as the pane id", () => {
		expect(layout.panes[0].listeners.split).toEqual({});
		expect(layout.panes[0].listeners.close).toEqual({});

		expect(layout.on("split", "root", () => {}).isOk()).toBe(true);

		expect(layout.panes[0].listeners.split).toHaveProperty("0");
		expect(layout.panes[0].listeners.close).toEqual({});

		layout.on("close", "root", () => {});

		expect(layout.panes[0].listeners.split).toHaveProperty("0");
		expect(layout.panes[0].listeners.close).toHaveProperty("0");
	});
});

describe("event unsubscribing", () => {
	it("unsubscribes from the given pane and event", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });
		layout.on("close", 2, () => {});
		layout.on("close", 2, () => {});
		layout.on("split", 3, () => {});
		layout.on("split", 3, () => {});

		expect(Object.keys(layout.panes[2].listeners.close)).toEqual(["0", "1"]);
		expect(Object.keys(layout.panes[3].listeners.split)).toEqual(["0", "1"]);

		layout.unsub("close", 2, 0);
		layout.unsub("split", 3, 1);

		expect(Object.keys(layout.panes[2].listeners.close)).toEqual(["1"]);
		expect(Object.keys(layout.panes[3].listeners.split)).toEqual(["0"]);

		layout.unsub("close", 2, 1);
		layout.unsub("split", 3, 0);

		expect(layout.panes[2].listeners.close).toEqual({});
		expect(layout.panes[3].listeners.split).toEqual({});
	});

	it("fails if the given pane does not exist", () => {
		expect(layout.unsub("split", 1, 0).isOk()).toBe(false);
	});

	it("fails if the given listener id is not registered", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });
		layout.on("close", 1, () => {});

		expect(layout.unsub("close", 1, 1).isOk()).toBe(false);
		expect(layout.unsub("close", 1, 0).isOk()).toBe(true);
		expect(layout.unsub("close", 1, 0).isOk()).toBe(false);
	});

	it("does not work with the pane id 0 (root pane)", () => {
		layout.on("split", "root", () => {});

		expect(layout.unsub("split", 0, 0).isOk()).toBe(false);
	});

	it("works with 'root' instead of passing 0 as the pane id", () => {
		layout.on("split", "root", () => {});
		layout.on("close", "root", () => {});

		expect(layout.panes[0].listeners.split).toHaveProperty("0");
		expect(layout.panes[0].listeners.close).toHaveProperty("0");

		expect(layout.unsub("split", "root", 0).isOk()).toBe(true);

		expect(layout.panes[0].listeners.split).toEqual({});
		expect(layout.panes[0].listeners.close).toHaveProperty("0");

		expect(layout.unsub("close", "root", 0).isOk()).toBe(true);

		expect(layout.panes[0].listeners.split).toEqual({});
		expect(layout.panes[0].listeners.close).toEqual({});
	});
});
