import { ActCreate } from "./create";
import { type State } from "$lib/core/state";

export class ActRoot {
	state: State;

	constructor(state: State) {
		this.state = state;
	}

	create() {
		return new ActCreate(this.state);
	}
}
