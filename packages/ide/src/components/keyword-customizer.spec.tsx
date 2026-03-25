// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const useKeywordsMock = vi.fn();

vi.mock("@/contexts/KeywordContext", () => ({
  useKeywords: () => useKeywordsMock(),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
  }) => <h2 id={id}>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogClose: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("./ui/border-beam", () => ({
  BorderBeam: () => null,
}));

vi.mock("./buttons/hero", () => ({
  HeroButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("lucide-react", () => ({
  X: () => <span>x</span>,
}));

import { KeywordCustomizer } from "./keyword-customizer";

function createKeywordsContext(overrides: Record<string, unknown> = {}) {
  const mappings = [
    { original: "int", custom: "int", tokenId: 21 },
    { original: "bool", custom: "bool", tokenId: 55 },
  ];

  return {
    mappings,
    blockDelimiters: { open: "", close: "" },
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: "",
    replaceKeywords: vi.fn(),
    setOperatorWordMap: vi.fn(),
    setBooleanLiteralMap: vi.fn(),
    setStatementTerminatorLexeme: vi.fn(),
    setBlockDelimiters: vi.fn(),
    validateKeyword: vi.fn(() => null),
    validateBooleanLiteralMap: vi.fn(() => null),
    validateOperatorWordMap: vi.fn(() => null),
    validateStatementTerminatorLexeme: vi.fn(() => null),
    validateBlockDelimiters: vi.fn(() => null),
    semicolonMode: "optional-eol",
    setSemicolonMode: vi.fn(),
    blockMode: "delimited",
    setBlockMode: vi.fn(),
    typingMode: "untyped",
    setTypingMode: vi.fn(),
    arrayMode: "dynamic",
    setArrayMode: vi.fn(),
    isOpenKeywordCustomizer: true,
    setIsOpenKeywordCustomizer: vi.fn(),
    ...overrides,
  };
}

describe("KeywordCustomizer", () => {
  beforeEach(() => {
    useKeywordsMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function render() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<KeywordCustomizer />);
    });

    return { container, root };
  }

  it("shows bool as a customizable type keyword", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    expect(container.textContent).toContain("bool");

    act(() => {
      root.unmount();
    });
  });

  it("disables fixed array mode when typing mode is untyped", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    const fixedButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Tamanho fixo"),
    );

    expect(fixedButton).toBeDefined();
    expect(fixedButton?.disabled).toBe(true);
    expect(container.textContent).toContain(
      "Vetores/matrizes com tamanho fixo só estão disponíveis no modo tipado.",
    );

    act(() => {
      root.unmount();
    });
  });

  it("shows a dedicated boolean literals section", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    expect(container.textContent).toContain("Literais Booleanos");
    expect(container.textContent).toContain("true");
    expect(container.textContent).toContain("false");

    act(() => {
      root.unmount();
    });
  });

  it("shows a dedicated statement terminator section", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    expect(container.textContent).toContain("Terminador de Instrução");
    expect(container.textContent).toContain("Substitui o ;");

    act(() => {
      root.unmount();
    });
  });
});
