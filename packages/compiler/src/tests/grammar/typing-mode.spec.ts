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

  it("accepts scan type-token syntax in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            scan(int, x);
          }
        `,
        { grammar: { typingMode: "typed" } },
      ),
    ).not.toThrow();
  });

  it("accepts scan format syntax in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            scan("%f", x);
          }
        `,
        { grammar: { typingMode: "typed" } },
      ),
    ).not.toThrow();
  });

  it("accepts typed scan syntax with indexed assignable targets", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int vetor[3];
            int matriz[2][2];
            scan(int, vetor[1]);
            scan("%d", matriz[1][1]);
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("accepts bare scan syntax in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            variavel x = 0;
            scan(x);
          }
        `,
        { grammar: { typingMode: "untyped" } },
      ),
    ).not.toThrow();
  });

  it("accepts bare scan syntax with indexed assignable targets in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            scan(lista[1][2]);
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects typed scan syntax in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            variavel x = 0;
            scan(int, x);
          }
        `,
        { grammar: { typingMode: "untyped" } },
      ),
    ).toThrow();
  });

  it("accepts untyped dynamic array declaration syntax in dynamic mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects untyped dynamic array declaration syntax in fixed mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });
});
