import { describe, test, expect } from "vitest";
import { err, ok } from "./result";

describe("result type", () => {
	test("ok function", () => {
		const v = ok("val");

		expect(v.value).toEqual({ variant: "ok", value: "val" });
	});

	test("err function", () => {
		const v = err(Error("msg"));

		expect(v.value).toEqual({ variant: "err", value: Error("msg") });
	});

	test("is ok", () => {
		expect(ok(1).isOk()).toBe(true);
		expect(err(Error("msg")).isOk()).toBe(false);
	});

	test("is err", () => {
		expect(ok(1).isErr()).toBe(false);
		expect(err(Error("msg")).isErr()).toBe(true);
	});

	test("unwrap or else", () => {
		expect(ok(1).unwrapOrElse(_ => 2)).toBe(1);
		expect(err(Error("msg")).unwrapOrElse(_ => 2)).toBe(2);
	});

	test("unwrap", () => {
		expect(ok(1).unwrap()).toBe(1);
		expect(() => ok(1).unwrap()).not.toThrow();
	});

	test("unwrap throws", () => {
		expect(() => err(Error("msg")).unwrap()).toThrow();
	});
});
