import { describe, expect, it } from "vitest";
import { compileToIr } from "./helpers";

describe("Grammar Typing Mode", () => {
  it("accepts typed declarations/functions in typed mode", () => {
    const source = `
      int soma(int a, int b) { return a + b; }
      int main() { int x = 1; return soma(x, 2); }
    `;

    expect(() =>
      compileToIr(source, { grammar: { typingMode: "typed" } }),
    ).not.toThrow();
  });

  it("accepts untyped declarations/functions in untyped mode", () => {
    const source = `
      funcao soma(a, b) { return a + b; }
      funcao main() { variavel x = 1; return soma(x, 2); }
    `;

    expect(() =>
      compileToIr(source, { grammar: { typingMode: "untyped" } }),
    ).not.toThrow();
  });

  it("rejects typed function signature in untyped mode", () => {
    expect(() =>
      compileToIr(`int main(){ return 1; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|statement/i);
  });

  it("rejects typed variable declaration in untyped mode", () => {
    expect(() =>
      compileToIr(`funcao main(){ int x = 1; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|statement/i);
  });

  it("rejects typed parameters in untyped mode", () => {
    expect(() =>
      compileToIr(`funcao soma(int a){ return a; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|parameter/i);
  });
});
