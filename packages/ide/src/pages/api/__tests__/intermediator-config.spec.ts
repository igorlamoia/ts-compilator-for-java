import { describe, expect, it, vi } from "vitest";

const { mockGenerateIntermediateCode, TokenIteratorMock } = vi.hoisted(() => {
  const mockGenerateIntermediateCode = vi.fn(() => []);
  const TokenIteratorMock = vi.fn(function TokenIteratorMock() {
    return {
      generateIntermediateCode: mockGenerateIntermediateCode,
      getWarnings: () => [],
      getInfos: () => [],
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
        grammar: {
          semicolonMode: "required",
          blockMode: "indentation",
          typingMode: "untyped",
        },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    handler(req, res);

    expect(TokenIteratorMock).toHaveBeenCalledWith(expect.any(Array), {
      locale: "pt-BR",
      grammar: {
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
      },
    });
  });

  it("preserves operatorWordMap when building the intermediate compiler config", () => {
    const req = {
      body: {
        tokens: [{ lexeme: "x" }],
        locale: "pt-BR",
        grammar: {
          semicolonMode: "required",
          blockMode: "indentation",
          typingMode: "untyped",
        },
        operatorWordMap: {
          logical_and: "and",
        },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    handler(req, res);

    expect(TokenIteratorMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        grammar: expect.any(Object),
        operatorWordMap: { logical_and: "and" },
      }),
    );
  });

  it("returns compiler warnings from TokenIterator", () => {
    const req = {
      body: {
        tokens: [{ lexeme: "x" }],
        locale: "pt-BR",
        grammar: {
          semicolonMode: "required",
          blockMode: "indentation",
          typingMode: "typed",
        },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    mockGenerateIntermediateCode.mockReturnValue([]);
    TokenIteratorMock.mockImplementation(function TokenIteratorWithWarnings() {
      return {
      generateIntermediateCode: mockGenerateIntermediateCode,
      getWarnings: () => [
        {
          code: "grammar.lossy_int_conversion",
          message: "warn",
          line: 2,
          column: 9,
          type: "warning",
          params: null,
        },
      ],
      getInfos: () => [],
      };
    });

    handler(req, res);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        warnings: [
          expect.objectContaining({
            code: "grammar.lossy_int_conversion",
          }),
        ],
      }),
    );
  });
});
