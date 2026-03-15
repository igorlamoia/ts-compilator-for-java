import { TOKENS } from "../../token/constants";
import { expect, it } from "vitest";

it("should be able to get token id from description or from id", () => {
  expect(TOKENS.BY_DESCRIPTION["plus"]).toBe(1);
  expect(TOKENS.BY_ID[1]).toBe("plus");
});

it("should include switch/case/default and colon tokens", () => {
  expect(TOKENS.BY_DESCRIPTION["switch"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["case"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["default"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["colon"]).toBeDefined();
});

it("should include boolean reserved tokens", () => {
  expect(TOKENS.BY_DESCRIPTION["bool"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["true"]).toBeDefined();
  expect(TOKENS.BY_DESCRIPTION["false"]).toBeDefined();
});
