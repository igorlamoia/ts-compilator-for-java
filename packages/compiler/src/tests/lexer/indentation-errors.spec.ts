import { describe, expect, it } from "vitest";
import { IssueError } from "../../issue/error";
import { Lexer } from "../../lexer";
import type { LexerConfig } from "../../lexer";

describe("Lexer indentation mode errors", () => {
  function captureIssueError(source: string, options: LexerConfig) {
    try {
      new Lexer(source, options).scanTokens();
      return undefined;
    } catch (error) {
      return error as IssueError;
    }
  }

  it("rejects brace-based blocks when indentation mode is enabled", () => {
    expect(() =>
      new Lexer("int main(){ return 1; }", {
        indentationBlock: true,
      }).scanTokens(),
    ).toThrow();
  });

  it("rejects mixed tabs and spaces in indentation prefix", () => {
    expect(() =>
      new Lexer("int main():\n  \tprint(1);", {
        indentationBlock: true,
        tabWidth: 4,
      }).scanTokens(),
    ).toThrow();
  });

  it("rejects later blocks that switch to a different inferred indent unit", () => {
    const source = [
      "int main():",
      "    if (ready):",
      "        print(1);",
      "    if (other):",
      "      print(2);",
    ].join("\n");

    const error = captureIssueError(source, {
      indentationBlock: true,
      locale: "en",
      tabWidth: 4,
    });

    expect(error).toBeInstanceOf(IssueError);
    expect(error?.details.code).toBe("lexer.invalid_indent_unit");
    expect(error?.message).toMatch(/exactly one inferred indent unit/i);
  });

  it("rejects child blocks that jump more than one logical level", () => {
    const source = [
      "int main():",
      "  print(1);",
      "  if (ready):",
      "      print(1);",
    ].join("\n");

    const error = captureIssueError(source, {
      indentationBlock: true,
      tabWidth: 4,
    });

    expect(error).toBeInstanceOf(IssueError);
    expect(error?.details.code).toBe("lexer.invalid_indent_unit");
  });

  it("rejects sibling lines that do not align to the same block depth", () => {
    const source = [
      "int main():",
      "    if (ready):",
      "        print(1);",
      "      print(2);",
    ].join("\n");

    const error = captureIssueError(source, {
      indentationBlock: true,
      tabWidth: 4,
    });

    expect(error).toBeInstanceOf(IssueError);
    expect(error?.details.code).toBe("lexer.invalid_dedent");
  });
});
