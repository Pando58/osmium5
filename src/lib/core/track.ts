import { emit } from "./emitEvent";
import { ActionError } from "./query";
import { type State } from "./state";
import { err, ok, type Result } from "$lib/result/result";
import { generateId } from "$lib/utils/generateId";

export class Track {
	sectionIds: number[] = [];

	static create(state: State, timelineId: number): Result<0, ActionError> {
		if (!(timelineId in state.timelines)) {
			return err(new ActionError("NonExistentItem", `Timeline #${timelineId} does not exist`));
		}

		const trackId = generateId(state.tracks);

		state.tracks[trackId] = new Track();
		state.timelines[timelineId].trackIds.push(trackId);

		emit(state, "track_created", { id: trackId, timelineId });

		return ok(0);
	}
}
