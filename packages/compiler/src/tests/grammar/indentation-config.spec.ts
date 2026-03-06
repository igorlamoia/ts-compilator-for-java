import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TokenIterator } from "../../token/TokenIterator";

describe("indentation config surface", () => {
  it("exposes indentation block mode via iterator grammar config", () => {
    const lexer = new Lexer("int main():\n    return value", {
      locale: "en",
      indentationBlock: true,
    });

    const iterator = new TokenIterator(lexer.scanTokens(), {
      locale: "en",
      grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
    });

    expect(iterator.getBlockMode()).toBe("indentation");
  });
});
