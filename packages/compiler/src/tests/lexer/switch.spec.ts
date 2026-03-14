import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("Lexer Switch", () => {
  it("should tokenize switch, case, default and colon", () => {
    const source = `int main(){ int x = 1; switch(x){ case 1: print("a"); default: break; } }`;
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    const types = tokens.map((token) => token.type);

    expect(types).toContain(TOKENS.RESERVEDS.switch);
    expect(types).toContain(TOKENS.RESERVEDS.case);
    expect(types).toContain(TOKENS.RESERVEDS.default);
    expect(types).toContain(TOKENS.SYMBOLS.colon);
  });
});
