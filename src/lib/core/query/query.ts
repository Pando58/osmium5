import { type State } from "../state";
import { ActRoot } from "./actions";

export function query(state: State) {
	return new ActRoot(state);
}
