import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";

describe("statement terminator config", () => {
  it("accepts a symbolic statement terminator lexeme", () => {
    expect(
      () =>
        new Lexer("int main() { print(1); }", {
          statementTerminatorLexeme: "!!",
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
});
