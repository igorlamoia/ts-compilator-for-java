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
  const customization = {
    mappings,
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
    modes: {
      semicolon: "optional-eol",
      block: "delimited",
      typing: "untyped",
      array: "dynamic",
    },
    ui: {
      isKeywordCustomizerOpen: true,
    },
  } as const;

  return {
    customization,
    setCustomization: vi.fn(),
    setModes: vi.fn(),
    setUi: vi.fn(),
    setMappings: vi.fn(),
    updateKeyword: vi.fn(),
    resetCustomization: vi.fn(),
    buildKeywordMap: vi.fn(),
    buildLexerConfig: vi.fn(),
    validateKeyword: vi.fn(() => null),
    validateBooleanLiteralMap: vi.fn(() => null),
    validateOperatorWordMap: vi.fn(() => null),
    validateStatementTerminatorLexeme: vi.fn(() => null),
    validateBlockDelimiters: vi.fn(() => null),
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

  it("allows fixed array mode while typing mode is untyped", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    const fixedButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Tamanho fixo"),
    );

    expect(fixedButton).toBeDefined();
    expect(fixedButton?.disabled).toBe(false);
    expect(container.textContent).not.toContain(
      "Vetores/matrizes com tamanho fixo só estão disponíveis no modo tipado.",
    );

    act(() => {
      fixedButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(fixedButton?.className).toContain("border-cyan-500");

    act(() => {
      root.unmount();
    });
  });

  it("saves the consolidated draft through the grouped context API", () => {
    const context = createKeywordsContext({
      customization: {
        mappings: [{ original: "int", custom: "int", tokenId: 21 }],
        operatorWordMap: {},
        booleanLiteralMap: { true: "true", false: "false" },
        statementTerminatorLexeme: "",
        blockDelimiters: { open: "", close: "" },
        modes: {
          semicolon: "optional-eol",
          block: "delimited",
          typing: "untyped",
          array: "dynamic",
        },
        ui: {
          isKeywordCustomizerOpen: true,
        },
      },
    });
    useKeywordsMock.mockReturnValue(context);

    const { container, root } = render();

    const keywordInput = container.querySelector("#keyword-custom-input");
    expect(keywordInput).toBeInstanceOf(HTMLInputElement);

    act(() => {
      const input = keywordInput as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(input, "inteiro");
      input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    const saveButton = buttons.find((button) =>
      button.textContent?.includes("Salvar e Aplicar"),
    );
    expect(saveButton).toBeDefined();

    act(() => {
      saveButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(context.setCustomization).toHaveBeenCalledTimes(1);
    expect(context.setCustomization).toHaveBeenCalledWith(
      expect.objectContaining({
        mappings: [{ original: "int", custom: "inteiro", tokenId: 21 }],
        statementTerminatorLexeme: "",
        blockDelimiters: { open: "", close: "" },
        modes: {
          semicolon: "optional-eol",
          block: "delimited",
          typing: "untyped",
          array: "dynamic",
        },
        ui: {
          isKeywordCustomizerOpen: false,
        },
      }),
    );
    expect(context.setModes).not.toHaveBeenCalled();
    expect(context.setUi).not.toHaveBeenCalled();
    expect(context.setMappings).not.toHaveBeenCalled();

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
