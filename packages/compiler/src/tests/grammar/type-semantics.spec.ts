import { describe, expect, it } from "vitest";
import { compileProgram, executeProgram } from "./helpers";

describe("Type semantics warnings", () => {
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
});

describe("Type semantics runtime", () => {
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
