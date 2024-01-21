import { emit } from "./emitEvent";
import { ActionError } from "./query";
import { type State } from "./state";
import { Track } from "./track";
import { err, ok, type Result } from "$lib/result/result";
import { generateId } from "$lib/utils/generateId";

export class Section {
	static create(state: State, trackId: number): Result<0, ActionError> {
		if (!(trackId in state.tracks)) {
			return err(new ActionError("NonExistentItem", `Track #${trackId} does not exist`));
		}

		const sectionId = generateId(state.sections);

		state.sections[sectionId] = new Track();
		state.tracks[trackId].sectionIds.push(sectionId);

		emit(state, "section_created", { id: sectionId, trackId });

		return ok(0);
	}
}
