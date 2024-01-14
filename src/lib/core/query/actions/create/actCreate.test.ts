import { describe, beforeEach, it, expect } from "vitest";
import { query } from "$lib/core/query";
import { State } from "$lib/core/state";
import { type Result } from "$lib/result/result";

function checkQueriesOk(queries: Result<unknown, Error>[], toBe = true) {
	for (const q of queries) {
		expect(q.isOk()).toBe(toBe);
	}
}

describe("create", () => {
	let state: State;

	beforeEach(() => {
		state = new State();
	});

	describe("timeline", () => {
		it("creates new timelines", () => {
			expect(state.timelines).toEqual({});

			checkQueriesOk([
				query(state).create().timeline(),
				query(state).create().timeline(),
				query(state).create().timeline(),
			]);

			expect(Object.keys(state.timelines)).toEqual(["0", "1", "2"]);
		});

		it("emits the 'timeline_created' event", () => {
			let timelineId = -1;

			state.on("timeline_created", ({ id }) => {
				timelineId = id;
			});

			query(state).create().timeline();

			expect(timelineId).toBe(0);

			query(state).create().timeline();
			query(state).create().timeline();

			expect(timelineId).toBe(2);

			query(state).create().timeline();

			expect(timelineId).toBe(3);
		});
	});

	describe("track", () => {
		it("fails if the timeline does not exist", () => {
			expect(state.timelines).toEqual({});

			checkQueriesOk([
				query(state).create().track(0),
			], false);
		});

		it("creates new tracks", () => {
			expect(state.tracks).toEqual({});

			query(state).create().timeline();

			checkQueriesOk([
				query(state).create().track(0),
				query(state).create().track(0),
				query(state).create().track(0),
			]);

			expect(Object.keys(state.tracks)).toEqual(["0", "1", "2"]);
		});

		it("adds the track id to the timeline", () => {
			query(state).create().timeline();

			expect(state.timelines[0].tracks).toEqual([]);

			query(state).create().track(0);

			expect(state.timelines[0].tracks).toEqual([0]);

			query(state).create().timeline();
			query(state).create().track(0);
			query(state).create().track(1);
			query(state).create().track(0);
			query(state).create().track(0);

			expect(state.timelines[0].tracks).toEqual([0, 1, 3, 4]);
		});

		it("emits the 'track_created' event", () => {
			let trackId = -1;

			state.on("track_created", ({ id }) => {
				trackId = id;
			});

			query(state).create().timeline();
			query(state).create().track(0);

			expect(trackId).toBe(0);

			query(state).create().track(0);
			query(state).create().track(0);

			expect(trackId).toBe(2);

			query(state).create().track(0);

			expect(trackId).toBe(3);
		});

		it("emits the 'track_created' event with the right timelineId", () => {
			let tlId = -1;

			state.on("track_created", ({ timelineId }) => {
				tlId = timelineId;
			});

			query(state).create().timeline();
			query(state).create().timeline();
			query(state).create().timeline();
			query(state).create().track(2);

			expect(tlId).toBe(2);

			query(state).create().track(0);

			expect(tlId).toBe(0);

			query(state).create().track(1);

			expect(tlId).toBe(1);
		});
	});

	describe("section", () => {
		it("fails if the track does not exist", () => {
			expect(state.tracks).toEqual({});

			checkQueriesOk([
				query(state).create().section(0),
			], false);
		});

		it("creates new sections", () => {
			expect(state.sections).toEqual({});

			query(state).create().timeline();
			query(state).create().track(0);

			checkQueriesOk([
				query(state).create().section(0),
				query(state).create().section(0),
				query(state).create().section(0),
			]);

			expect(Object.keys(state.sections)).toEqual(["0", "1", "2"]);
		});

		it("adds the section id to the track", () => {
			query(state).create().timeline();
			query(state).create().track(0);

			expect(state.tracks[0].sections).toEqual([]);

			query(state).create().section(0);

			expect(state.tracks[0].sections).toEqual([0]);

			query(state).create().timeline();
			query(state).create().track(0);
			query(state).create().section(0);
			query(state).create().section(1);
			query(state).create().section(0);
			query(state).create().section(0);

			expect(state.tracks[0].sections).toEqual([0, 1, 3, 4]);
		});

		it("emits the 'section_created' event", () => {
			let sectionId = -1;

			state.on("section_created", ({ id }) => {
				sectionId = id;
			});

			query(state).create().timeline();
			query(state).create().track(0);
			query(state).create().section(0);

			expect(sectionId).toBe(0);

			query(state).create().section(0);
			query(state).create().section(0);

			expect(sectionId).toBe(2);

			query(state).create().section(0);

			expect(sectionId).toBe(3);
		});

		it("emits the 'section_created' event with the right trackId", () => {
			let tlId = -1;

			state.on("section_created", ({ trackId }) => {
				tlId = trackId;
			});

			query(state).create().timeline();
			query(state).create().track(0);
			query(state).create().track(0);
			query(state).create().track(0);
			query(state).create().section(2);

			expect(tlId).toBe(2);

			query(state).create().section(0);

			expect(tlId).toBe(0);

			query(state).create().section(1);

			expect(tlId).toBe(1);
		});
	});
});
