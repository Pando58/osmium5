import { type StateEvents } from "./events";
import { type State } from "./state";

export function emit<T extends keyof StateEvents>(state: State, event: T, payload: StateEvents[T]) {
	for (const f of Object.values(state.listeners[event])) {
		f(payload);
	}
}
