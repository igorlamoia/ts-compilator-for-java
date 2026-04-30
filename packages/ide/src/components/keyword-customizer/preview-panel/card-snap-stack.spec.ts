import { describe, expect, it } from "vitest";

import { resolveCardSnapIndex } from "./card-snap-stack";

describe("resolveCardSnapIndex", () => {
  it("advances one card at a time", () => {
    expect(resolveCardSnapIndex(1, "next", 4)).toBe(2);
  });

  it("moves back one card at a time", () => {
    expect(resolveCardSnapIndex(2, "previous", 4)).toBe(1);
  });

  it("does not advance past the last card", () => {
    expect(resolveCardSnapIndex(3, "next", 4)).toBe(3);
  });

  it("does not move before the first card", () => {
    expect(resolveCardSnapIndex(0, "previous", 4)).toBe(0);
  });

  it("keeps an empty stack on the initial card index", () => {
    expect(resolveCardSnapIndex(0, "next", 0)).toBe(0);
  });
});
