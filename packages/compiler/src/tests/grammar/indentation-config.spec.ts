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
  it("should'nt throw error when indentation block mode is enabled and code is properly indented", () => {
    const code = `
int main():
  print("Início do programa")
  int x = 5;
  int y = 10
  if(x < y):
    print("x é menor que y kkkk\\n")
  else:
    print("x é maior ou igual a y\\n")

  print("\\nacabou do programa")
  string oi = "oi"
  switch(oi):
    case 1:
    case "oi":
      print("AAAAAAAAAAA")
      break
    default:
      print("Bbb")
`;
    const lexer = new Lexer(code, {
      locale: "en",
      indentationBlock: true,
    });

    const iterator = new TokenIterator(lexer.scanTokens(), {
      locale: "en",
      grammar: { blockMode: "indentation", semicolonMode: "optional-eol" },
    });

    expect(() => iterator.generateIntermediateCode()).not.toThrow();
  });
});
