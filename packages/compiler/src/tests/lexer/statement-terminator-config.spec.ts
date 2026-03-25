import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("statement terminator config", () => {
  it("accepts a symbolic statement terminator lexeme", () => {
    expect(
      () =>
        new Lexer("int main() { print(1); }", {
          statementTerminatorLexeme: "@@",
          locale: "en",
        }),
    ).not.toThrow();
  });

  it("rejects empty or whitespace terminators", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "   ",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects semicolon as a custom terminator", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: ";",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects terminators that reuse fixed operator or symbol characters", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "!!",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("tokenizes the configured terminator as semicolon token for normal statements", () => {
    const lexer = new Lexer("int main() { print(1) @@ }", {
      statementTerminatorLexeme: "@@",
      locale: "en",
    });

    const semicolonTokens = lexer
      .scanTokens()
      .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

    expect(semicolonTokens).toHaveLength(1);
    expect(semicolonTokens[0]?.lexeme).toBe("@@");
  });
});
