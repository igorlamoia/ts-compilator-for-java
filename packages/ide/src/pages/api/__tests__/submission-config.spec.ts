import { describe, expect, it, vi } from "vitest";

const {
  LexerMock,
  scanTokensMock,
  TokenIteratorMock,
  generateIntermediateCodeMock,
  findUniqueMock,
  buildEffectiveKeywordMapMock,
} = vi.hoisted(() => {
  const scanTokensMock = vi.fn(() => [{ type: "IDENT" }]);
  const LexerMock = vi.fn(function LexerMock() {
    return {
      scanTokens: scanTokensMock,
      warnings: [],
      infos: [],
    };
  });

  const generateIntermediateCodeMock = vi.fn(() => []);
  const TokenIteratorMock = vi.fn(function TokenIteratorMock() {
    return {
      generateIntermediateCode: generateIntermediateCodeMock,
    };
  });

  const findUniqueMock = vi.fn(async () => ({ testCases: [] }));
  const buildEffectiveKeywordMapMock = vi.fn((keywordMap) => keywordMap ?? {});

  return {
    LexerMock,
    scanTokensMock,
    TokenIteratorMock,
    generateIntermediateCodeMock,
    findUniqueMock,
    buildEffectiveKeywordMapMock,
  };
});

vi.mock("@ts-compilator-for-java/compiler/src/lexer", () => ({
  Lexer: LexerMock,
}));
vi.mock("@ts-compilator-for-java/compiler/token/TokenIterator", () => ({
  TokenIterator: TokenIteratorMock,
}));
vi.mock(
  "@ts-compilator-for-java/compiler/issue",
  () => ({
    IssueError: class extends Error {
      details: { line: number; message: string };
      constructor(message: string, details: { line: number; message: string }) {
        super(message);
        this.details = details;
      }
    },
  }),
  { virtual: true },
);
vi.mock(
  "@ts-compilator-for-java/compiler/interpreter",
  () => ({
    Interpreter: class {},
  }),
  { virtual: true },
);
vi.mock(
  "@ts-compilator-for-java/compiler/interpreter/constants",
  () => ({
    Instruction: class {},
  }),
  { virtual: true },
);
vi.mock(
  "@/lib/prisma",
  () => ({
    default: {
      exercise: { findUnique: findUniqueMock },
      submission: { create: vi.fn() },
    },
  }),
  { virtual: true },
);
vi.mock(
  "@/lib/keyword-map",
  () => ({
    buildEffectiveKeywordMap: buildEffectiveKeywordMapMock,
  }),
  { virtual: true },
);

import handler from "../submissions/validate";

describe("/api/submissions/validate config propagation", () => {
  it("normalizes payload and passes config to lexer and iterator", async () => {
    const req = {
      method: "POST",
      headers: { "x-user-id": "student-1" },
      query: { dryRun: "true" },
      body: {
        exerciseId: "exercise-1",
        sourceCode: "main() { print(1) }",
        locale: "pt-BR",
        keywordMap: { exibir: 33 },
        operatorWordMap: { logical_and: "and" },
        booleanLiteralMap: { true: "yes", false: "no" },
        indentationBlock: false,
        blockDelimiters: { open: "begin", close: "end" },
        grammar: {
          semicolonMode: "required",
          blockMode: "indentation",
          typingMode: "untyped",
          arrayMode: "dynamic",
        },
      },
    } as any;

    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const res = { status, json } as any;

    await handler(req, res);

    expect(LexerMock).toHaveBeenCalledWith("main() { print(1) }", {
      customKeywords: { exibir: 33 },
      operatorWordMap: { logical_and: "and" },
      booleanLiteralMap: { true: "yes", false: "no" },
      blockDelimiters: undefined,
      indentationBlock: true,
    });

    expect(TokenIteratorMock).toHaveBeenCalledWith([{ type: "IDENT" }], {
      locale: "pt-BR",
      grammar: {
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
    });
  });
});
