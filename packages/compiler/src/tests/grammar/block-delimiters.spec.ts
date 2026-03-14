import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TokenIterator } from "../../token/TokenIterator";
import { functionCall } from "../../grammar/syntax/function-call";

describe("Grammar Block Delimiters", () => {
  it("should parse blocks using configured begin/end delimiters", () => {
    const source = `
      int main() begin
        int x = 1;
        if (x == 1) begin
          print("ok");
        end
      end
    `;

    const lexer = new Lexer(source, {
      locale: "en",
      blockDelimiters: { open: "begin", close: "end" },
    });

    const iterator = new TokenIterator(lexer.scanTokens(), "en");
    while (iterator.hasNext()) functionCall(iterator);

    expect(iterator.emitter.getInstructions().length).toBeGreaterThan(0);
  });

  it("should allow braces and configured words in the same source", () => {
    const source = `
      int main() begin
        if (1 == 1) { print("a"); }
      end
    `;

    const lexer = new Lexer(source, {
      blockDelimiters: { open: "begin", close: "end" },
      locale: "en",
    });

    const iterator = new TokenIterator(lexer.scanTokens(), "en");
    while (iterator.hasNext()) functionCall(iterator);

    expect(iterator.emitter.getInstructions().length).toBeGreaterThan(0);
  });
});
