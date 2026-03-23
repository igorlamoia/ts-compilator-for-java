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

    expect(tokens.map((t) => t.type)).toEqual(
      expect.arrayContaining([
        TOKENS.SYMBOLS.newline,
        TOKENS.SYMBOLS.indent,
        TOKENS.SYMBOLS.dedent,
      ]),
    );
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
