import { describe, expect, it } from "vitest";
import { compileToIr } from "./helpers";

describe("Grammar Switch Statement", () => {
  it("should emit dispatch and case labels for int and string cases", () => {
    const source = `
      int main() {
        int x = 1;
        switch (x) {
          case 1:
            print("one");
            break;
          case "1":
            print("string-one");
            break;
          default:
            print("default");
        }
      }
    `;

    const ir = compileToIr(source);

    expect(ir.some((instruction) => instruction.op === "==")).toBe(true);
    expect(ir.some((instruction) => instruction.op === "IF")).toBe(true);
    expect(ir.some((instruction) => instruction.op === "LABEL")).toBe(true);
  });

  it("should allow fallthrough when case has no break", () => {
    const source = `
      int main() {
        int x = 1;
        switch (x) {
          case 1:
            print("a");
          case 2:
            print("b");
            break;
        }
      }
    `;

    const ir = compileToIr(source);
    const printCalls = ir.filter(
      (instruction) =>
        instruction.op === "CALL" && instruction.result === "PRINT",
    );

    expect(printCalls.length).toBe(2);
    expect(printCalls[0].operand1).toBe('"a"');
    expect(printCalls[1].operand1).toBe('"b"');
  });

  it("should emit break jump to switch end", () => {
    const source = `
      int main() {
        int x = 1;
        switch (x) {
          case 1:
            break;
          default:
            print("d");
        }
      }
    `;

    const ir = compileToIr(source);
    const labelIndexes = new Map<string, number>();

    ir.forEach((instruction, index) => {
      if (instruction.op === "LABEL") {
        labelIndexes.set(instruction.result, index);
      }
    });

    const jumpTargets = ir
      .filter((instruction) => instruction.op === "JUMP")
      .map((instruction) => instruction.result);

    const jumpToSwitchEndExists = jumpTargets.some((target) => {
      const labelIndex = labelIndexes.get(target);
      if (labelIndex === undefined) return false;
      return ir[labelIndex + 1]?.op === "JUMP";
    });

    expect(jumpToSwitchEndExists).toBe(true);
  });
});
