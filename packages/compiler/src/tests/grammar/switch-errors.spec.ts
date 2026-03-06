import { describe, expect, it } from "vitest";
import { compileToIr } from "./helpers";

describe("Grammar Switch Errors", () => {
  it("should reject duplicate case labels", () => {
    const source = `
      int main() {
        switch (1) {
          case 1:
            break;
          case 0x1:
            break;
        }
      }
    `;

    expect(() => compileToIr(source)).toThrow(/Duplicate case label/i);
  });

  it("should reject invalid case literal expressions", () => {
    const source = `
      int main() {
        switch (1) {
          case x:
            break;
        }
      }
    `;

    expect(() => compileToIr(source)).toThrow(/Invalid case literal/i);
  });

  it("should reject case outside switch", () => {
    const source = `
      int main() {
        case 1:
          break;
      }
    `;

    expect(() => compileToIr(source)).toThrow(/case statement outside switch/i);
  });
});
