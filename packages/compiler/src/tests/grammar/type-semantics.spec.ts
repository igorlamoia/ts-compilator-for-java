import { describe, expect, it } from "vitest";
import { compileProgram, compileToIr, executeProgram } from "./helpers";
import { TokenIterator } from "../../token/TokenIterator";

describe("Type semantics warnings", () => {
  it("preserves array symbol metadata while resolving scalar element type", () => {
    const iterator = new TokenIterator([], {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    });

    iterator.declareSymbolDescriptor("matriz", {
      kind: "array",
      baseType: "int",
      dimensions: 2,
      arrayMode: "fixed",
      sizes: [3, 3],
    });

    expect(iterator.resolveSymbol("matriz")).toBe("int");
    expect(iterator.resolveSymbolDescriptor("matriz")).toEqual({
      kind: "array",
      baseType: "int",
      dimensions: 2,
      arrayMode: "fixed",
      sizes: [3, 3],
    });
  });

  it("accepts bool declarations and function signatures", () => {
    const result = compileProgram(`
      bool isReady(bool value) {
        return value;
      }

      int main() {
        bool flag = true;
        return 0;
      }
    `);

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(0);
    expect(result.instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "DECLARE",
          result: "value",
          operand1: "bool",
        }),
        expect.objectContaining({
          op: "DECLARE",
          result: "flag",
          operand1: "bool",
        }),
        expect.objectContaining({
          op: "=",
          result: "flag",
          operand1: "true",
        }),
      ]),
    );
  });

  it("reports a warning when assigning a float literal to an int", () => {
    const result = compileProgram(`
      int main() {
        int x = 3.9;
        return x;
      }
    `);

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });

  it("warns when returning a float expression from an int function", () => {
    const result = compileProgram(`
      int main() {
        return 3.9;
      }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("warns when passing a float expression to an int parameter", () => {
    const result = compileProgram(`
      int soma(int a) { return a; }
      int main() { return soma(4.2); }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("warns for each lossy float-to-int write in the same program", () => {
    const result = compileProgram(`
      int soma(float a, float b) {
        return a + b;
      }

      int main() {
        int x = 0.5;
        int y = 1.2;
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(3);
  });

  it("warns when a float scan hint writes into an int variable", () => {
    const result = compileProgram(`
      int main() {
        int x = 0;
        scan(float, x);
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it('warns when a %f scan hint writes into an int variable', () => {
    const result = compileProgram(`
      int main() {
        int x = 0;
        scan("%f", x);
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("does not warn when an int scan hint writes into a float variable", () => {
    const result = compileProgram(`
      int main() {
        float x = 0.0;
        scan(int, x);
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(0);
  });

  it("accepts fixed array declarations in fixed array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[3][3];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("emits dedicated ir for fixed array declarations", () => {
    const instructions = compileToIr(
      `
        int main() {
          int matriz[2][2];
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "DECLARE_ARRAY",
          result: "matriz",
          operand1: "int",
        }),
      ]),
    );
  });

  it("rejects empty dimensions in fixed array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int lista[];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects mixed fixed and dynamic dimensions in fixed array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int tabela[3][];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts fixed array element reads in expressions", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            print(matriz[1][1]);
            return matriz[0][0] + 1;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("rejects partial fixed array access", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            print(matriz[1]);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts fixed array element writes", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][3];
            matriz[1][2] = 7;
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("accepts dynamic typed array declarations in dynamic mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int lista[];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects explicit sizes in dynamic array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[3][3];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).toThrow();
  });

  it("rejects incompatible fixed array element writes", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            matriz[1][1] = "x";
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });
});

describe("Type semantics runtime", () => {
  it("prints boolean declaration values", async () => {
    const result = await executeProgram(`
      int main() {
        bool flag = true;
        print(flag);
        return 0;
      }
    `);

    expect(result.output).toBe("true");
  });

  it("preserves boolean returns through function calls", async () => {
    const result = await executeProgram(`
      bool negate(bool value) {
        return !value;
      }

      int main() {
        print(negate(false));
        return 0;
      }
    `);

    expect(result.output).toBe("true");
  });

  it("truncates toward zero when storing float into int", async () => {
    const result = await executeProgram(`
      int main() {
        int x = 3.9;
        print(x);
        return 0;
      }
    `);

    expect(result.output).toBe("3");
  });

  it("truncates scanned float input when destination variable is int", async () => {
    const result = await executeProgram(
      `
        int main() {
          int x = 0;
          scan("%f", x);
          print(x);
          return 0;
        }
      `,
      { stdin: async () => "3.9" },
    );

    expect(result.output).toBe("3");
  });

  it("keeps declaration semantics when float variable uses int scan hint", async () => {
    const result = await executeProgram(
      `
        int main() {
          float x = 0.0;
          scan(int, x);
          print(x);
          return 0;
        }
      `,
      { stdin: async () => "3" },
    );

    expect(result.output).toBe("3");
  });

  it("uses the scan int hint before writing into a float variable", async () => {
    const result = await executeProgram(
      `
        int main() {
          float x = 0.0;
          scan(int, x);
          print(x);
          return 0;
        }
      `,
      { stdin: async () => "3.9" },
    );

    expect(result.output).toBe("3");
  });

  it("truncates negative floats toward zero for int", async () => {
    const result = await executeProgram(`
      int main() {
        int x = -3.9;
        print(x);
        return 0;
      }
    `);

    expect(result.output).toBe("-3");
  });

  it("emits plain string instruction operands for typed conditions", () => {
    const result = compileProgram(`
      int main() {
        int x = 1;
        if (x < 2) {
          print(x);
        }
        return 0;
      }
    `);

    const ifInstruction = result.instructions.find(
      (instruction) => instruction.op === "IF",
    );

    expect(ifInstruction).toBeDefined();
    expect(typeof ifInstruction?.result).toBe("string");
    expect(ifInstruction?.result).not.toMatchObject({
      place: expect.anything(),
    });
  });

  it("initializes fixed arrays at runtime without crashing", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[2][2];
          print(1);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("1");
  });

  it("writes and reads fixed array elements at runtime", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[2][3];
          matriz[1][2] = 7;
          print(matriz[1][2]);
          return matriz[1][2];
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("7");
  });

  it("auto-grows dynamic arrays on write", async () => {
    const result = await executeProgram(
      `
        int main() {
          int lista[];
          lista[4] = 10;
          print(lista[4]);
          return lista[4];
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("10");
  });

  it("raises runtime error on fixed array out-of-bounds read", async () => {
    await expect(
      executeProgram(
        `
          int main() {
            int matriz[2][2];
            print(matriz[3][0]);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.array_read_out_of_bounds",
    });
  });

  it("raises runtime error on dynamic array missing read", async () => {
    await expect(
      executeProgram(
        `
          int main() {
            int lista[];
            print(lista[2]);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.array_missing_value",
    });
  });

  it("supports multidimensional dynamic writes then reads", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[][];
          matriz[1][2] = 9;
          print(matriz[1][2]);
          return matriz[1][2];
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("9");
  });

  it("preserves bool and string array element value types", async () => {
    const result = await executeProgram(
      `
        int main() {
          bool flags[];
          string nomes[];
          flags[0] = true;
          nomes[0] = "ok";
          print(flags[0]);
          print(nomes[0]);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("trueok");
  });

  it("supports untyped dynamic array declaration syntax at runtime", async () => {
    const result = await executeProgram(
      `
        funcao main() {
          lista[] = [];
          lista[0] = 1;
          print(lista[0]);
          return 0;
        }
      `,
      { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("1");
  });

  it("raises runtime error on fixed array out-of-bounds write", async () => {
    await expect(
      executeProgram(
        `
          int main() {
            int matriz[2][2];
            matriz[3][0] = 1;
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.array_write_out_of_bounds",
    });
  });
});
