import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("operator word aliases", () => {
  it("tokenizes logical aliases with the same token IDs as symbols", () => {
    const lexer = new Lexer("if a and not b {}", {
      operatorWordMap: {
        logical_and: "and",
        logical_not: "not",
      },
    });

    const tokens = lexer.scanTokens();

    expect(tokens.map((token) => token.type)).toEqual(
      expect.arrayContaining([
        TOKENS.LOGICALS.logical_and,
        TOKENS.LOGICALS.logical_not,
      ]),
    );
  });

  it("tokenizes relational aliases with the same token IDs as symbols", () => {
    const lexer = new Lexer("if a less_equal b {}", {
      operatorWordMap: {
        less_equal: "less_equal",
      },
    });

    const tokens = lexer.scanTokens();

    expect(tokens.map((token) => token.type)).toContain(
      TOKENS.RELATIONALS.less_equal,
    );
  });

  it("rejects aliases that conflict with customized keywords", () => {
    expect(
      () =>
        new Lexer("if a and b {}", {
          customKeywords: { se: TOKENS.RESERVEDS.if },
          operatorWordMap: { logical_and: "se" },
        }),
    ).toThrow(/conflict|reserved|keyword/i);
  });
});
