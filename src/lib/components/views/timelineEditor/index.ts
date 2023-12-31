import { type PaneView } from "../paneView";
import TimelineEditorBarLeft from "./TimelineEditorBarLeft.svelte";
import TimelineEditorMain from "./TimelineEditorMain.svelte";

export const timelineEditor: PaneView = {
	name: "Timeline Editor",
	main: TimelineEditorMain,
	barLeft: TimelineEditorBarLeft,
};
