import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";

describe("Lexer indentation mode errors", () => {
  it("rejects brace-based blocks when indentation mode is enabled", () => {
    expect(() =>
      new Lexer("int main(){ return 1; }", {
        indentationBlock: true,
      }).scanTokens(),
    ).toThrow();
  });

  it("rejects mixed tabs and spaces in indentation prefix", () => {
    expect(() =>
      new Lexer("int main():\n  \tprint(1);", {
        indentationBlock: true,
        tabWidth: 4,
      }).scanTokens(),
    ).toThrow();
  });
});
