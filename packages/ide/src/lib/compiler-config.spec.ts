import { describe, expect, it } from "vitest";
import { normalizeCompilerConfig } from "./compiler-config";

describe("normalizeCompilerConfig", () => {
  it("defaults to delimited + optional-eol", () => {
    const normalized = normalizeCompilerConfig({});

    expect(normalized.grammar).toEqual({
      semicolonMode: "optional-eol",
      blockMode: "delimited",
      typingMode: "typed",
    });
    expect(normalized.indentationBlock).toBe(false);
    expect(normalized.blockDelimiters).toBeUndefined();
  });

  it("forces indentationBlock=true and strips delimiters in indentation mode", () => {
    const normalized = normalizeCompilerConfig({
      indentationBlock: false,
      blockDelimiters: { open: "begin", close: "end" },
      grammar: { semicolonMode: "required", blockMode: "indentation" },
    });

    expect(normalized.indentationBlock).toBe(true);
    expect(normalized.blockDelimiters).toBeUndefined();
  });

  it("preserves grammar from UI payload when present", () => {
    const normalized = normalizeCompilerConfig({
      grammar: {
        semicolonMode: "required",
        blockMode: "delimited",
        typingMode: "untyped",
      },
    });

    expect(normalized.grammar.semicolonMode).toBe("required");
    expect(normalized.grammar.typingMode).toBe("untyped");
  });

  it("preserves operator word aliases in the normalized payload", () => {
    const normalized = normalizeCompilerConfig({
      operatorWordMap: {
        logical_and: "and",
        less_equal: "less_equal",
      },
    });

    expect(normalized.operatorWordMap).toEqual({
      logical_and: "and",
      less_equal: "less_equal",
    });
  });
});
