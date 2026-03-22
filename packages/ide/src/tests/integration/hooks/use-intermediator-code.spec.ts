// @vitest-environment jsdom

import React, { useEffect } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { IssueDetails, IssueError } from "@ts-compilator-for-java/compiler/issue";
import type { TToken } from "@/@types/token";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const {
  showLineIssuesMock,
  cleanIssuesMock,
  showToastMock,
  buildLexerConfigMock,
  saveCurrentFileMock,
  postMock,
  TokenIteratorMock,
} = vi.hoisted(() => ({
  showLineIssuesMock: vi.fn(),
  cleanIssuesMock: vi.fn(),
  showToastMock: vi.fn(),
  buildLexerConfigMock: vi.fn(() => ({
    grammar: {
      semicolonMode: "required",
      blockMode: "indentation",
      typingMode: "untyped",
    },
    operatorWordMap: { logical_and: "and" },
  })),
  saveCurrentFileMock: vi.fn(),
  postMock: vi.fn(async () => {
    throw new Error("api should not be used");
  }),
  TokenIteratorMock: vi.fn(),
}));

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => ({
    showLineIssues: showLineIssuesMock,
    cleanIssues: cleanIssuesMock,
  }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
  }),
}));

vi.mock("@/contexts/KeywordContext", () => ({
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

vi.mock("@ts-compilator-for-java/compiler/token/TokenIterator", () => ({
  TokenIterator: TokenIteratorMock,
}));

import { useIntermediatorCode } from "@/hooks/useIntermediatorCode";

type HookValue = ReturnType<typeof useIntermediatorCode>;

let hookValue: HookValue;

function HookHarness() {
  const value = useIntermediatorCode();

  useEffect(() => {
    hookValue = value;
  }, [value]);

  return null;
}

describe("useIntermediatorCode", () => {
  beforeEach(() => {
    hookValue = undefined as unknown as HookValue;
    showLineIssuesMock.mockReset();
    cleanIssuesMock.mockReset();
    showToastMock.mockReset();
    buildLexerConfigMock.mockClear();
    saveCurrentFileMock.mockReset();
    postMock.mockClear();
    TokenIteratorMock.mockReset();
    TokenIteratorMock.mockImplementation(function TokenIterator() {
      return {
        generateIntermediateCode: vi.fn(() => [{ op: "=" }]),
        getWarnings: () => [new IssueDetails("warn", "careful", 1, 1, "warning")],
        getInfos: () => [new IssueDetails("info", "info", 1, 2, "info")],
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

  it("runs TokenIterator directly and preserves success behavior", async () => {
    const root = renderHook();
    const tokens = [{ lexeme: "x" } as TToken];

    let result = false;
    await act(async () => {
      result = await hookValue.handleIntermediateCodeGeneration(tokens);
    });

    expect(postMock).not.toHaveBeenCalled();
    expect(TokenIteratorMock).toHaveBeenCalledWith(tokens, {
      locale: "en",
      grammar: {
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
      },
      operatorWordMap: { logical_and: "and" },
    });
    expect(result).toBe(true);
    expect(hookValue.intermediateCode.instructions).toEqual([{ op: "=" }]);
    expect(hookValue.intermediateCode.warnings).toHaveLength(1);
    expect(hookValue.intermediateCode.infos).toHaveLength(1);
    expect(showLineIssuesMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "warning" }),
    );
    expect(saveCurrentFileMock).toHaveBeenCalledWith("Main.java");

    await act(async () => {
      root.unmount();
    });
  });

  it("preserves IssueError handling", async () => {
    TokenIteratorMock.mockImplementation(function TokenIterator() {
      return {
        generateIntermediateCode: vi.fn(() => {
          throw new IssueError("iterator.error", "bad instruction", 3, 4);
        }),
        getWarnings: () => [],
        getInfos: () => [],
      };
    });

    const root = renderHook();

    let result = true;
    await act(async () => {
      result = await hookValue.handleIntermediateCodeGeneration([
        { lexeme: "x" } as TToken,
      ]);
    });

    expect(result).toBe(false);
    expect(showLineIssuesMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          message: "bad instruction",
          startLineNumber: 3,
          startColumn: 4,
        }),
      ],
      true,
    );
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "bad instruction",
        type: "error",
      }),
    );

    await act(async () => {
      root.unmount();
    });
  });
});
