import { describe, expect, it, vi } from "vitest";

const { LexerMock } = vi.hoisted(() => {
  const LexerMock = vi.fn(function LexerMock() {
    return {
      scanTokens: vi.fn(() => []),
      warnings: [],
      infos: [],
    };
  });

  return { LexerMock };
});

vi.mock("@ts-compilator-for-java/compiler/src/lexer", () => ({
  Lexer: LexerMock,
}));
vi.mock(
  "@ts-compilator-for-java/compiler/issue",
  () => ({
    IssueError: class extends Error {
      details: unknown;
      constructor(message: string, details: unknown) {
        super(message);
        this.details = details;
      }
    },
  }),
  { virtual: true },
);

import handler from "../lexer";

describe("/api/lexer config propagation", () => {
  it("passes operatorWordMap to the lexer endpoint", () => {
    const req = {
      body: {
        sourceCode: "if a and b {}",
        locale: "pt-BR",
        operatorWordMap: { logical_and: "and" },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    handler(req, res);

    expect(LexerMock).toHaveBeenCalledWith(
      "if a and b {}",
      expect.objectContaining({
        operatorWordMap: { logical_and: "and" },
      }),
    );
  });
});
