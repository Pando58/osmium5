export class Result<T, E extends Error> {
	value: ResultVariant<T, E>;

	constructor(value: ResultVariant<T, E>) {
		this.value = value;
	}

	isOk() {
		return this.value.variant === "ok";
	}

	isErr() {
		return this.value.variant === "err";
	}

	map<U>(f: (v: T) => U): Result<U, E> {
		const { variant, value } = this.value;

		if (variant === "err") return err(value);

		return ok(f(value));
	}

	unwrapOrElse<U>(f: (e: E) => U) {
		const { variant, value } = this.value;

		return variant === "ok" ? value : f(value);
	}

	unwrapOrLog<U>(v: U) {
		return this.unwrapOrElse(e => {
			console.error(e);
			return v;
		});
	}

	unwrap() {
		if (this.value.variant === "err") {
			throw this.value.value;
		}

		return this.value.value;
	}
}

export function ok<T, E extends Error>(value: T) {
	return new Result<T, E>({ variant: "ok", value });
}

export function err<T, E extends Error>(value: E) {
	return new Result<T, E>({ variant: "err", value });
}

type ResultVariant<T, E> =
	| { variant: "ok"; value: T }
	| { variant: "err"; value: E };
