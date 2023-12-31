import { type ComponentType } from "svelte";

export type PaneView = {
	name: string;
	main: ComponentType;
	barLeft?: ComponentType;
	barMiddle?: ComponentType;
	barRight?: ComponentType;
};
