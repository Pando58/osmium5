import { describe, it, expect } from "vitest";
import { generateId } from "./generateId";

describe("generate id", () => {
	it("returns the list size when every possible id is taken", () => {
		expect(generateId(new Set([0, 1, 2]))).toBe(3);
	});

	it("returns the first not taken id starting from zero", () => {
		expect(generateId(new Set([1, 2, 3]))).toBe(0);
		expect(generateId(new Set([0, 2, 3]))).toBe(1);
		expect(generateId(new Set([0, 1, 3]))).toBe(2);
	});
});
