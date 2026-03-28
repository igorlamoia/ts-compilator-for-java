import { describe, expect, it } from "vitest";
import {
  getDefaultKeywordMappings,
  type BlockDelimiters,
} from "@/contexts/keyword/KeywordContext";
import { validateOperatorWordMap } from "./operator-word-map";

describe("operator word alias validation", () => {
  it("rejects duplicate operator aliases", () => {
    const error = validateOperatorWordMap(
      { logical_and: "and", logical_or: "and" },
      getDefaultKeywordMappings(),
      { open: "", close: "" },
    );

    expect(error).toMatch(/already|duplicate/i);
  });

  it("rejects aliases that collide with customized keywords", () => {
    const error = validateOperatorWordMap(
      { logical_and: "if" },
      getDefaultKeywordMappings(),
      { open: "", close: "" } as BlockDelimiters,
    );

    expect(error).toMatch(/keyword|conflict/i);
  });
});
