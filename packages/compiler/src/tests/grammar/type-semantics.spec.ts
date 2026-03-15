import { describe, expect, it } from "vitest";
import { compileProgram, executeProgram } from "./helpers";

describe("Type semantics warnings", () => {
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
});
