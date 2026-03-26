import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("Lexer indentation tokens", () => {
  it("emits newline, indent and dedent in indentation mode", () => {
    const src = `int main():\n    int x = 1;\n    if (x == 1):\n        print(x);\n    print(2);`;
    const tokens = new Lexer(src, {
      indentationBlock: true,
      tabWidth: 4,
    }).scanTokens();

    expect(
      tokens
        .map((t) => t.type)
        .filter(
          (type) =>
            type === TOKENS.SYMBOLS.newline ||
            type === TOKENS.SYMBOLS.indent ||
            type === TOKENS.SYMBOLS.dedent,
        ),
    ).toEqual([
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.indent,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.indent,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.dedent,
      TOKENS.SYMBOLS.dedent,
    ]);
  });

  it("accepts aligned sibling blocks and nested blocks reusing the inferred unit", () => {
    const src = `int main():
    if (ready):
        print(1);
        print(2);
    if (other):
        print(3);`;

    const tokens = new Lexer(src, {
      indentationBlock: true,
      tabWidth: 4,
    }).scanTokens();

    expect(
      tokens
        .map((t) => t.type)
        .filter(
          (type) =>
            type === TOKENS.SYMBOLS.newline ||
            type === TOKENS.SYMBOLS.indent ||
            type === TOKENS.SYMBOLS.dedent,
        ),
    ).toEqual([
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.indent,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.indent,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.dedent,
      TOKENS.SYMBOLS.newline,
      TOKENS.SYMBOLS.indent,
      TOKENS.SYMBOLS.dedent,
      TOKENS.SYMBOLS.dedent,
    ]);
  });

  it("tokenizes bracket symbols", () => {
    const tokens = new Lexer("int values[2];").scanTokens();

    expect(tokens.map((t) => t.type)).toEqual(
      expect.arrayContaining([
        TOKENS.SYMBOLS.left_bracket,
        TOKENS.SYMBOLS.right_bracket,
      ]),
    );
  });
});
