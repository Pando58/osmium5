export type StateEvents = {
	timeline_created: { id: number };
	track_created: { id: number; timelineId: number };
	section_created: { id: number; trackId: number };
};
