import { describe, expect, beforeEach, it } from "vitest";
import { Layout } from "./layout";

let layout: Layout;

beforeEach(() => {
	layout = new Layout();
});

describe("layout init", () => {
	it("creates the root pane", () => {
		expect(layout.panes[0].pane).toEqual({
			root: true,
			split: false,
		});
	});

	it("does not have any other panes besides the root", () => {
		expect(Object.keys(layout.panes)).toEqual(["0"]);
	});
});

describe("get pane", () => {
	it("returns a pane", () => {
		layout.createPane("root");

		expect(layout.getPane(1).unwrap()).toEqual(expect.objectContaining({
			parentId: 0,
			split: false,
		}));
	});

	it("fails to get a nonexistent pane", () => {
		expect(layout.panes).not.toHaveProperty("1");
		expect(layout.getPane(1).isOk()).toBe(false);
	});

	it("does not work with the pane id 0 (root pane)", () => {
		expect(layout.getPane(0).isOk()).toBe(false);
	});
});

describe("create pane", () => {
	it("creates the first pane", () => {
		expect(layout.createPane("root").isOk()).toBe(true);

		expect(layout.panes[1].pane).toEqual(expect.objectContaining({
			parentId: 0,
			split: false,
		}));

		expect(layout.panes[0].pane.split).toBe(true);
	});

	it("fails to create the first pane twice", () => {
		layout.createPane("root");

		expect(layout.createPane("root").isOk()).toBe(false);
	});

	it("splits and creates child panes", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });

		expect(layout.panes[1].pane).toEqual(expect.objectContaining({
			split: true,
			direction: "vertical",
			childrenId: [2, 3],
		}));
		expect(layout.panes[2].pane).toEqual(expect.objectContaining({
			size: 100,
			unit: "weight",
			parentId: 1,
			split: false,
		}));
		expect(layout.panes[3].pane).toEqual(expect.objectContaining({
			size: 100,
			unit: "weight",
			parentId: 1,
			split: false,
		}));
	});

	it("fails if the given pane does not exist", () => {
		expect(layout.panes).not.toHaveProperty("1");
		expect(layout.createPane({ parentId: 1, direction: "horizontal" }).isOk()).toBe(false);
	});

	it("fails when using pane id 0 (root pane)", () => {
		expect(layout.createPane({ parentId: 0, direction: "horizontal" }).isOk()).toBe(false);
		expect(Object.keys(layout.panes)).toEqual(["0"]);
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

		expect(layout.panes[1].pane).toEqual(expect.objectContaining({
			childrenId: [2, 3, 4],
		}));
	});

	it("prepends a pane to an already split pane", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });
		layout.createPane({ parentId: 1, order: "prepend" });

		expect(layout.panes[1].pane).toEqual(expect.objectContaining({
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

	it("notifies the pane after updating it", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		layout.on("split", 2, () => {
			expect(layout.panes[2].pane.split).toBe(true);
		});

		layout.createPane({ parentId: 2, direction: "vertical" });
	});
});

describe("close pane", () => {
	it("closes the given pane", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });
		layout.createPane({ parentId: 1, order: "prepend" });
		layout.createPane({ parentId: 1, order: "append" });

		expect(Object.keys(layout.panes)).toEqual(["0", "1", "2", "3", "4", "5"]);
		expect(layout.closePane(2).isOk()).toBe(true);
		expect(Object.keys(layout.panes)).toEqual(["0", "1", "3", "4", "5"]);
		expect(layout.closePane(4).isOk()).toBe(true);
		expect(Object.keys(layout.panes)).toEqual(["0", "1", "3", "5"]);
	});

	it("fails if the given pane does not exist", () => {
		expect(layout.panes).not.toHaveProperty("1");
		expect(layout.closePane(1).isOk()).toBe(false);
	});

	it("fails when using pane id 0 (root pane)", () => {
		expect(layout.closePane(0).isOk()).toBe(false);
		expect(layout.panes).toHaveProperty("0");
	});

	it("closes direct child panes", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });
		layout.createPane({ parentId: 1, order: "append" });
		layout.createPane({ parentId: 2, direction: "vertical" });
		layout.createPane({ parentId: 2, order: "append" });

		expect(Object.keys(layout.panes)).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);

		layout.closePane(2);

		expect(Object.keys(layout.panes)).toEqual(["0", "1", "3", "4"]);
	});

	it("closes nested child panes", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });
		layout.createPane({ parentId: 2, direction: "vertical" });
		layout.createPane({ parentId: 5, direction: "horizontal" });
		layout.createPane({ parentId: 6, direction: "vertical" });
		layout.createPane({ parentId: 1, order: "prepend" });

		expect(Object.keys(layout.panes)).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);

		layout.closePane(2);

		expect(Object.keys(layout.panes)).toEqual(["0", "1", "3", "10"]);
	});

	it("notifies the direct panes", () => {
		let notified1 = false;
		let notified2 = false;
		let notified4 = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });
		layout.createPane({ parentId: 2, direction: "horizontal" });

		layout.on("close", 1, () => notified1 = true);
		layout.on("close", 2, () => notified2 = true);
		layout.on("close", 4, () => notified4 = true);

		layout.closePane(4);
		expect(notified4).toBe(true);

		layout.closePane(2);
		expect(notified2).toBe(true);

		layout.closePane(1);
		expect(notified1).toBe(true);
	});

	it("deletes all listeners when closing the pane", () => {
		layout.createPane("root");

		layout.on("split", 1, () => {});
		layout.on("split", 1, () => {});
		layout.on("unsplit", 1, () => {});
		layout.on("close", 1, () => {});

		expect(Object.keys(layout.panes[1].listeners.split)).toEqual(["0", "1"]);
		expect(Object.keys(layout.panes[1].listeners.unsplit)).toEqual(["0"]);
		expect(Object.keys(layout.panes[1].listeners.close)).toEqual(["0"]);

		const pane = layout.panes[1]; // Save it before layout.panes[1] is undefined

		layout.closePane(1);

		expect(pane.listeners.split).toEqual({});
		expect(pane.listeners.unsplit).toEqual({});
		expect(pane.listeners.close).toEqual({});
	});

	it("notifies child panes before closing them", () => {
		let notified2 = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		layout.on("close", 2, () => notified2 = true);

		layout.closePane(1);

		expect(notified2).toBe(true);
	});

	it("updates the children list of the parent", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });
		layout.createPane({ parentId: 1, order: "append" });
		layout.createPane({ parentId: 3, direction: "horizontal" });
		layout.createPane({ parentId: 3, order: "append" });

		// pane 0 doesn't have the childrenId prop
		expect("childrenId" in layout.panes[1].pane && layout.panes[1].pane.childrenId).toEqual([2, 3, 4]);
		expect("childrenId" in layout.panes[3].pane && layout.panes[3].pane.childrenId).toEqual([5, 6, 7]);

		layout.closePane(2);
		layout.closePane(6);

		expect("childrenId" in layout.panes[1].pane && layout.panes[1].pane.childrenId).toEqual([3, 4]);
		expect("childrenId" in layout.panes[3].pane && layout.panes[3].pane.childrenId).toEqual([5, 7]);
	});

	it("fails if the parent does not have the pane registered as a child", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });

		if ("childrenId" in layout.panes[1].pane) layout.panes[1].pane.childrenId = [];

		expect(layout.closePane(2).isOk()).toBe(false);
	});

	it("does not notify if something fails", () => {
		let notified = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });
		layout.on("close", 2, () => notified = true);

		if ("childrenId" in layout.panes[1].pane) layout.panes[1].pane.childrenId = [];

		layout.closePane(2);

		expect(notified).toBe(false);
	});

	it("unsplits the parent back from a container into a normal one", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });

		expect(Object.keys(layout.panes)).toEqual(["0", "1", "2", "3"]);
		expect(layout.panes[1].pane.split).toBe(true);
		expect(layout.panes[1].pane).toHaveProperty("childrenId");
		expect(layout.panes[1].pane).toHaveProperty("direction");

		layout.closePane(3);

		expect(Object.keys(layout.panes)).toEqual(["0", "1"]);
		expect(layout.panes[1].pane.split).toBe(false);
		expect(layout.panes[1].pane).not.toHaveProperty("childrenId");
		expect(layout.panes[1].pane).not.toHaveProperty("direction");
	});

	it("also unsplits the root pane", () => {
		layout.createPane("root");

		expect(layout.panes[0].pane.split).toBe(true);

		layout.closePane(1);

		expect(layout.panes[0].pane.split).toBe(false);
	});

	it("notifies the parent about the unsplit", () => {
		let notified = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		layout.on("unsplit", 1, () => notified = true);

		layout.closePane(2);

		expect(notified).toBe(true);
	});

	it("notifies the parent about the unsplit when it still has children remaning", () => {
		let notified = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });
		layout.createPane({ parentId: 1, order: "append" });

		layout.on("unsplit", 1, () => notified = true);

		layout.closePane(2);

		expect(notified).toBe(true);
	});

	it("notifies the parent about the unsplit after updating it", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		layout.on("unsplit", 1, () => {
			expect(layout.panes[1].pane.split).toBe(false);
		});

		layout.closePane(2);
	});

	it("notifies the child panes about the close event before notifying the parent about the unsplit", () => {
		let notifiedParent = false;
		let notifiedChild1 = false;
		let notifiedChild2 = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });

		layout.on("unsplit", 1, () => {
			notifiedParent = true;

			expect(notifiedChild1).toBe(true);
			expect(notifiedChild2).toBe(true);
		});
		layout.on("close", 2, () => {
			notifiedChild1 = true;

			expect(notifiedParent).toBe(false);
		});
		layout.on("close", 3, () => {
			notifiedChild2 = true;

			expect(notifiedParent).toBe(false);
		});

		layout.closePane(2);

		expect(notifiedParent).toBe(true);
		expect(notifiedChild1).toBe(true);
		expect(notifiedChild2).toBe(true);
	});

	it("notifies the root pane about the unsplit event", () => {
		let notified = false;

		layout.createPane("root");
		layout.on("unsplit", "root", () => notified = true);

		layout.closePane(1);

		expect(notified).toBe(true);
	});
});

describe("resize pane", () => {
	it("changes the size of the pane", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		expect(layout.resizePane(2, 50).isOk()).toBe(true);
		expect((layout.panes[2].pane as { size: number }).size).toBe(50);
		expect(layout.resizePane(2, 83).isOk()).toBe(true);
		expect((layout.panes[2].pane as { size: number }).size).toBe(83);
	});

	it("fails if the pane does not exist", () => {
		expect(layout.resizePane(2, 70).isOk()).toBe(false);
	});

	it("fails if the given pane id is either 0 or 1", () => {
		layout.createPane("root");

		expect(layout.resizePane(0, 40).isOk()).toBe(false);
		expect(layout.resizePane(1, 40).isOk()).toBe(false);
	});

	it("keeps the size unit if no other argument is given", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		const unit = (layout.panes[2].pane as { unit: "weight" | "exact" }).unit;

		layout.resizePane(2, 65);

		expect((layout.panes[2].pane as { unit: "weight" | "exact" }).unit).toBe(unit);
	});

	it("switches to the given unit", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		layout.resizePane(2, 40, "exact");

		expect((layout.panes[2].pane as { unit: "weight" | "exact" }).unit).toBe("exact");

		layout.resizePane(2, 40, "weight");

		expect((layout.panes[2].pane as { unit: "weight" | "exact" }).unit).toBe("weight");
	});

	it("notifies the pane about the resize", () => {
		let notified = false;

		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "vertical" });

		layout.on("resize", 2, () => notified = true);

		layout.resizePane(2, 140);

		expect(notified).toBe(true);
	});

	it("notifies the pane after updating it", () => {
		layout.createPane("root");
		layout.createPane({ parentId: 1, direction: "horizontal" });

		layout.on("resize", 2, () => {
			const pane = layout.panes[2].pane as { size: number; unit: "weight" | "exact" };

			expect(pane.size).toBe(245);
			expect(pane.unit).toBe("exact");
		});

		layout.resizePane(2, 245, "exact");
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
		expect(layout.panes[0].listeners.split).toEqual({});
	});

	it("works with 'root' instead of passing 0 as the pane id", () => {
		expect(layout.panes[0].listeners.split).toEqual({});
		expect(layout.panes[0].listeners.unsplit).toEqual({});

		expect(layout.on("split", "root", () => {}).isOk()).toBe(true);

		expect(layout.panes[0].listeners.split).toHaveProperty("0");
		expect(layout.panes[0].listeners.unsplit).toEqual({});

		layout.on("unsplit", "root", () => {});

		expect(layout.panes[0].listeners.split).toHaveProperty("0");
		expect(layout.panes[0].listeners.unsplit).toHaveProperty("0");
	});

	it("fails when subscribing to the close event on the root pane", () => {
		expect(layout.panes[0].listeners.close).toEqual({});

		expect(layout.on("close", "root", () => {}).isOk()).toBe(false);

		expect(layout.panes[0].listeners.close).toEqual({});
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
		expect(layout.panes[0].listeners.split).toHaveProperty("0");
	});

	it("works with 'root' instead of passing 0 as the pane id", () => {
		layout.on("split", "root", () => {});
		layout.on("unsplit", "root", () => {});

		expect(layout.panes[0].listeners.split).toHaveProperty("0");
		expect(layout.panes[0].listeners.unsplit).toHaveProperty("0");

		expect(layout.unsub("split", "root", 0).isOk()).toBe(true);

		expect(layout.panes[0].listeners.split).toEqual({});
		expect(layout.panes[0].listeners.unsplit).toHaveProperty("0");

		expect(layout.unsub("unsplit", "root", 0).isOk()).toBe(true);

		expect(layout.panes[0].listeners.split).toEqual({});
		expect(layout.panes[0].listeners.unsplit).toEqual({});
	});
});
