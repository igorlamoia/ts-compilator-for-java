import { describe, expect, it } from "vitest";
import { Classification } from "./classification";
import { classifyTokens } from "./editor/tokens";
import type { TToken } from "@/@types/token";
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";

describe("Classification", () => {
  it("classifies indent and dedent as symbols from compiler token ids alone", () => {
    const classifier = new Classification();

    expect(classifier.classifyToken(TOKENS.SYMBOLS.indent).type).toBe("SYMBOLS");
    expect(classifier.classifyToken(TOKENS.SYMBOLS.dedent).type).toBe("SYMBOLS");
  });

  it("keeps indent and dedent in the symbol bucket when batching tokens", () => {
    const classifier = new Classification();
    const tokens: TToken[] = [
      { column: 1, lexeme: "<INDENT>", line: 1, type: TOKENS.SYMBOLS.indent },
      { column: 1, lexeme: "<DEDENT>", line: 2, type: TOKENS.SYMBOLS.dedent },
    ];

    const formattedTokens = classifyTokens(tokens, classifier);

    expect(formattedTokens.SYMBOLS).toHaveLength(2);
    expect(formattedTokens.SYMBOLS.map(({ token }) => token.lexeme)).toEqual([
      "<INDENT>",
      "<DEDENT>",
    ]);
  });
});
