export class ActionError extends Error {
	variant: ActionErrorVariant;

	constructor(variant: ActionErrorVariant, message: string) {
		super(message);
		this.name = "ActionError";
		this.variant = variant;
	}
}

type ActionErrorVariant =
	| "NonExistentItem";
