import { TOKENS } from "../../token/constants";
import { expect, it } from "vitest";

it("should be able to get token id from description or from id", () => {
  expect(TOKENS.BY_DESCRIPTION["plus"]).toBe(1);
  expect(TOKENS.BY_ID[1]).toBe("plus");
});
