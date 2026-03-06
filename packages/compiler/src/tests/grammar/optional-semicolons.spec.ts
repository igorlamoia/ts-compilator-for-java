import { describe, expect, it } from "vitest";
import { compileToIr } from "./helpers";

describe("Grammar Optional Semicolons", () => {
  it("should parse blank lines between statements", () => {
    const source = `int main() {
      int x = 1;

      print(x);
    }`;

    const ir = compileToIr(source);
    expect(ir.some((i) => i.op === "DECLARE" && i.result === "x")).toBe(true);
  });
});
