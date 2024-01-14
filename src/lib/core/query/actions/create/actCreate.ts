import { type ActionError } from "$lib/core/query";
import { Section } from "$lib/core/section";
import { type State } from "$lib/core/state";
import { Timeline } from "$lib/core/timeline";
import { Track } from "$lib/core/track";
import { type Result } from "$lib/result/result";

export class ActCreate {
	state: State;

	constructor(state: State) {
		this.state = state;
	}

	timeline(): Result<0, ActionError> {
		return Timeline.create(this.state);
	}

	track(timelineId: number): Result<0, ActionError> {
		return Track.create(this.state, timelineId);
	}

	section(trackId: number): Result<0, ActionError> {
		return Section.create(this.state, trackId);
	}
}
