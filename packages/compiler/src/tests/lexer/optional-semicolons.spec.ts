import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("Lexer Optional Semicolons", () => {
  it("should emit NEWLINE tokens", () => {
    const source = `int main() {\nprint("a");\n}`;
    const tokens = new Lexer(source, { locale: "en" }).scanTokens();

    expect(tokens.some((t) => t.type === TOKENS.SYMBOLS.newline)).toBe(true);
  });
});
