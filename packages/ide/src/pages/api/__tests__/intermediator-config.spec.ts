import { describe, expect, it, vi } from "vitest";

const { mockGenerateIntermediateCode, TokenIteratorMock } = vi.hoisted(() => {
  const mockGenerateIntermediateCode = vi.fn(() => []);
  const TokenIteratorMock = vi.fn(function TokenIteratorMock() {
    return {
    generateIntermediateCode: mockGenerateIntermediateCode,
    };
  });

  return { mockGenerateIntermediateCode, TokenIteratorMock };
});

vi.mock("@ts-compilator-for-java/compiler/token/TokenIterator", () => ({
  TokenIterator: TokenIteratorMock,
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

import handler from "../intermediator";

describe("/api/intermediator config propagation", () => {
  it("passes grammar to TokenIterator", () => {
    const req = {
      body: {
        tokens: [{ lexeme: "x" }],
        locale: "pt-BR",
        grammar: { semicolonMode: "required", blockMode: "indentation" },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    handler(req, res);

    expect(TokenIteratorMock).toHaveBeenCalledWith(expect.any(Array), {
      locale: "pt-BR",
      grammar: { semicolonMode: "required", blockMode: "indentation" },
    });
  });
});
