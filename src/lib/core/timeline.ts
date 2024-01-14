import { emit } from "./emitEvent";
import { type ActionError } from "./query";
import { type State } from "./state";
import { type Result, ok } from "$lib/result/result";
import { generateId } from "$lib/utils/generateId";

export class Timeline {
	tracks: number[] = [];

	static create(state: State): Result<0, ActionError> {
		const timelineId = generateId(state.timelines);

		state.timelines[timelineId] = new Timeline();

		emit(state, "timeline_created", { id: timelineId });

		return ok(0);
	}
}
