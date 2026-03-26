import { describe, expect, it } from "vitest";
import { Classification } from "./classification";
import { classifyTokens } from "./editor/tokens";
import type { TToken } from "@/@types/token";

describe("Classification", () => {
  it("classifies indent and dedent as symbols when the lexeme disambiguates the collision", () => {
    const classifier = new Classification();

    expect(classifier.classifyToken(55, "<INDENT>").type).toBe("SYMBOLS");
    expect(classifier.classifyToken(56, "<DEDENT>").type).toBe("SYMBOLS");
  });

  it("forwards token lexemes through the batched token classifier", () => {
    const classifier = new Classification();
    const tokens: TToken[] = [
      { column: 1, lexeme: "<INDENT>", line: 1, type: 55 },
      { column: 1, lexeme: "<DEDENT>", line: 2, type: 56 },
    ];

    const formattedTokens = classifyTokens(tokens, classifier);

    expect(formattedTokens.SYMBOLS).toHaveLength(2);
    expect(formattedTokens.SYMBOLS.map(({ token }) => token.lexeme)).toEqual([
      "<INDENT>",
      "<DEDENT>",
    ]);
  });
});
