import { type PaneView } from "../paneView";
import InspectorMain from "./InspectorMain.svelte";

export const inspector: PaneView = {
	name: "Inspector",
	main: InspectorMain,
};
