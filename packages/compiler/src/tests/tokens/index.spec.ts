import {
  TOKENS_DESCRIPTION_TO_ID,
  TOKENS_ID_TO_DESCRIPTION,
} from "../../token/constants";
import { expect, it } from "vitest";

it("should be able to get token id from description or from id", () => {
  expect(TOKENS_DESCRIPTION_TO_ID["plus"]).toBe(1);
  expect(TOKENS_ID_TO_DESCRIPTION[1]).toBe("plus");
});
