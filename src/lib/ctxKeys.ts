import { type Layout } from "./layout/layout";

export const rootKey = Symbol();
export type RootContext = {
	layout: Layout;
};
