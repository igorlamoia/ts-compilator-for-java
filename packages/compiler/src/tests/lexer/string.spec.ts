import { Token } from "../../token";
import { Lexer } from "../../lexer";
import { describe, expect, it } from "vitest";

describe("Lexer String", () => {
  it("should scan tokens with string", () => {
    const source = `string s = "hy!";`;
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    expect(tokens).toEqual([
      new Token(23, "string", 1, 1),
      new Token(43, "s", 1, 8),
      new Token(15, "=", 1, 10),
      new Token(44, '"hy!"', 1, 12),
      new Token(36, ";", 1, 17),
    ]);
  });
  it("should change \\n -> '\\n' and \\t -> '\\t'", () => {
    const source = `string s = "hy!\\nSr.\\tLamoia\\n";`;
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    expect(tokens).toEqual([
      new Token(23, "string", 1, 1),
      new Token(43, "s", 1, 8),
      new Token(15, "=", 1, 10),
      new Token(44, '"hy!\nSr.\tLamoia\n"', 1, 12),
      new Token(36, ";", 1, 32),
    ]);
  });
  it("should change count one char -> \\ and keep the scan as usual", () => {
    const source = `"hy\\oi";`;
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens();
    expect(tokens).toEqual([
      new Token(44, '"hy\\oi"', 1, 1),
      new Token(36, ";", 1, 8),
    ]);
  });
});
