// @vitest-environment jsdom

import React, { useEffect } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorContext } from "@/contexts/editor/EditorContext";
import {
  IssueDetails,
  IssueError,
} from "@ts-compilator-for-java/compiler/issue";
import type { TToken } from "@/@types/token";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const {
  getEditorCodeMock,
  showLineIssuesMock,
  cleanIssuesMock,
  showToastMock,
  buildLexerConfigMock,
  saveCurrentFileMock,
  postMock,
  LexerMock,
} = vi.hoisted(() => ({
  getEditorCodeMock: vi.fn(() => "int x = 0;"),
  showLineIssuesMock: vi.fn(),
  cleanIssuesMock: vi.fn(),
  showToastMock: vi.fn(),
  buildLexerConfigMock: vi.fn(() => ({
    keywordMap: { inteiro: 21 },
    booleanLiteralMap: { true: "yes", false: "no" },
    statementTerminatorLexeme: "@@",
    blockDelimiters: { open: "begin", close: "end" },
    indentationBlock: false,
    grammar: {
      semicolonMode: "required",
      blockMode: "delimited",
      typingMode: "typed",
      arrayMode: "fixed",
    },
    operatorWordMap: { logical_and: "and" },
  })),
  saveCurrentFileMock: vi.fn(),
  postMock: vi.fn(async () => {
    throw new Error("api should not be used");
  }),
  LexerMock: vi.fn(),
}));

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => ({
    getEditorCode: getEditorCodeMock,
    showLineIssues: showLineIssuesMock,
    cleanIssues: cleanIssuesMock,
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
  }),
}));

vi.mock("@/contexts/keyword/KeywordContext", () => ({
  useKeywords: () => ({
    buildLexerConfig: buildLexerConfigMock,
  }),
}));

vi.mock("@/lib/local-api", () => ({
  localApi: {
    post: postMock,
  },
}));

vi.mock("next/router", () => ({
  useRouter: () => ({
    locale: "en",
  }),
}));

vi.mock("@ts-compilator-for-java/compiler/src/lexer", () => ({
  Lexer: LexerMock,
}));

import { useLexerAnalyse } from "@/hooks/useLexerAnalyse";

type HookValue = ReturnType<typeof useLexerAnalyse>;

let hookValue: HookValue;

function HookHarness() {
  const value = useLexerAnalyse();

  useEffect(() => {
    hookValue = value;
  }, [value]);

  return null;
}

describe("useLexerAnalyse", () => {
  beforeEach(() => {
    hookValue = undefined as unknown as HookValue;
    getEditorCodeMock.mockReturnValue("int x = 0;");
    showLineIssuesMock.mockReset();
    cleanIssuesMock.mockReset();
    showToastMock.mockReset();
    buildLexerConfigMock.mockClear();
    saveCurrentFileMock.mockReset();
    postMock.mockClear();
    LexerMock.mockReset();
    LexerMock.mockImplementation(function Lexer() {
      return {
        scanTokens: vi.fn(() => [
          { lexeme: "int", line: 1, column: 1 } as TToken,
        ]),
        warnings: [new IssueDetails("warn", "careful", 1, 1, "warning")],
        infos: [new IssueDetails("info", "info", 1, 2, "info")],
      };
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderHook() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          EditorContext.Provider,
          {
            value: {
              currentFilePath: "Main.java",
              saveCurrentFile: saveCurrentFileMock,
            } as any,
          },
          React.createElement(HookHarness),
        ),
      );
    });

    return root;
  }

  it("runs Lexer directly and preserves success behavior", async () => {
    const root = renderHook();

    let tokens: TToken[] | undefined;
    await act(async () => {
      tokens = await hookValue.handleRun();
    });

    expect(postMock).not.toHaveBeenCalled();
    expect(LexerMock).toHaveBeenCalledWith(
      "int x = 0;",
      expect.objectContaining({
        customKeywords: expect.objectContaining({ inteiro: 21 }),
        booleanLiteralMap: { true: "yes", false: "no" },
        statementTerminatorLexeme: "@@",
        blockDelimiters: { open: "begin", close: "end" },
        indentationBlock: false,
        operatorWordMap: { logical_and: "and" },
        locale: "en",
      }),
    );
    expect(tokens).toEqual([{ lexeme: "int", line: 1, column: 1 }]);
    expect(hookValue.analyseData.warnings).toHaveLength(1);
    expect(hookValue.analyseData.infos).toHaveLength(1);
    expect(showLineIssuesMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "warning" }),
    );
    expect(saveCurrentFileMock).toHaveBeenCalledWith("Main.java");
    expect(buildLexerConfigMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
  });

  it("preserves IssueError handling", async () => {
    LexerMock.mockImplementation(function Lexer() {
      return {
        scanTokens: vi.fn(() => {
          throw new IssueError("lexer.error", "bad token", 3, 4);
        }),
        warnings: [],
        infos: [],
      };
    });

    const root = renderHook();

    let result: TToken[] | undefined;
    await act(async () => {
      result = await hookValue.handleRun();
    });

    expect(result).toBeUndefined();
    expect(showLineIssuesMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          message: "bad token",
          startLineNumber: 3,
          startColumn: 4,
        }),
      ],
      true,
    );
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "bad token",
        type: "error",
      }),
    );

    await act(async () => {
      root.unmount();
    });
  });
});
