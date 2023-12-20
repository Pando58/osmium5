import { type Layout } from "./layout/Layout";

export const rootKey = Symbol();
export type RootContext = {
	layout: Layout;
};
