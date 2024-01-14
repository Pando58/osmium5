import { type StateEvents } from "./events";
import { type Section } from "./section";
import { type Timeline } from "./timeline";
import { type Track } from "./track";
import { ok } from "$lib/result/result";
import { generateId } from "$lib/utils/generateId";

export class State {
	timelines: Record<number, Timeline> = {};
	tracks: Record<number, Track> = {};
	sections: Record<number, Section> = {};
	listeners: { [T in keyof StateEvents]: Record<number, (res: StateEvents[T]) => void> } = {
		timeline_created: {},
		track_created: {},
		section_created: {},
	};

	on<T extends keyof StateEvents>(key: T, f: (res: StateEvents[T]) => void) {
		const listenerId = generateId(this.listeners);
		this.listeners[key][listenerId] = f;

		return ok(listenerId);
	}
}
