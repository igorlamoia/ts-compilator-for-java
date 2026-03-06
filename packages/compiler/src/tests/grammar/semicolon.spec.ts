import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TokenIterator } from "../../token/TokenIterator";
import { compileToIr } from "./helpers";

describe("Grammar Semicolon Mode Config", () => {
  it("should expose required semicolon mode when configured on iterator", () => {
    const lexer = new Lexer("int main(){ print(1); }", { locale: "en" });
    const iterator = new TokenIterator(lexer.scanTokens(), {
      locale: "en",
      grammar: { semicolonMode: "required" },
    });

    expect(iterator.getSemicolonMode()).toBe("required");
  });

  it("should fail missing semicolon when strict mode is requested through helper", () => {
    const source = `
      int main() {
        int a = 1
      }
    `;

    expect(() =>
      compileToIr(source, {
        grammar: { semicolonMode: "required" },
      }),
    ).toThrow(/Unexpected token/);
  });
});

describe("Grammar Optional Semicolons", () => {
  it("should accept newline-terminated statement without semicolon in optional mode", () => {
    const source = `
      int main() {
        int a = 1
        print(a);
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should reject same-line consecutive statements without semicolon in optional mode", () => {
    const source = `
      int main() {
        int a = 1 print(a);
      }
    `;

    expect(() => compileToIr(source)).toThrow(/Unexpected token/);
  });
});
