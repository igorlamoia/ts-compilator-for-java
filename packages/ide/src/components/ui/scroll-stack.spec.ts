import { describe, expect, it } from "vitest";
import { resolveScrollStackCardOpacity } from "./scroll-stack";

describe("resolveScrollStackCardOpacity", () => {
  it("keeps non-active cards fully opaque", () => {
    expect(resolveScrollStackCardOpacity(0, 1, 0.5)).toBe(1);
  });

  it("keeps the active card opaque until overlap starts", () => {
    expect(resolveScrollStackCardOpacity(0, 0, 0)).toBe(1);
  });

  it("fades the active card as the next card overlaps", () => {
    expect(resolveScrollStackCardOpacity(0, 0, 1)).toBeCloseTo(0.82, 2);
  });
});
