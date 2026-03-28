// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import {
  KeywordProvider,
  getDefaultCustomizationState,
  getDefaultBooleanLiteralMap,
  getDefaultKeywordMappings,
  migrateStoredMappings,
  useKeywords,
} from "@/contexts/keyword/KeywordContext";
import {
  validateStatementTerminatorLexemeImpl,
  validateBooleanLiteralAliases,
  validateCustomKeyword,
} from "@/contexts/keyword/keyword-validator";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import { vi, beforeEach, afterEach } from "vitest";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

const { monacoRefMock, retokenizeMock, updateJavaMMKeywordsMock } = vi.hoisted(
  () => ({
    monacoRefMock: { current: {} },
    retokenizeMock: vi.fn(),
    updateJavaMMKeywordsMock: vi.fn(),
  }),
);

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => ({
    monacoRef: monacoRefMock,
    retokenize: retokenizeMock,
  }),
}));

vi.mock("@/utils/compiler/editor/editor-language", () => ({
  updateJavaMMKeywords: updateJavaMMKeywordsMock,
}));

let capturedKeywords: ReturnType<typeof useKeywords> | null = null;

function CaptureKeywords() {
  capturedKeywords = useKeywords();
  return null;
}

describe("keyword context lexer config", () => {
  beforeEach(() => {
    capturedKeywords = null;
    retokenizeMock.mockReset();
    updateJavaMMKeywordsMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("exposes a nested customization object with grouped setters", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    act(() => {
      capturedKeywords?.setModes((prev) => ({
        ...prev,
        typing: "untyped",
        array: "fixed",
      }));
      capturedKeywords?.setUi((prev) => ({
        ...prev,
        isKeywordCustomizerOpen: true,
      }));
    });

    expect(capturedKeywords?.customization.modes.typing).toBe("untyped");
    expect(capturedKeywords?.customization.modes.array).toBe("fixed");
    expect(capturedKeywords?.customization.ui.isKeywordCustomizerOpen).toBe(
      true,
    );
    expect(capturedKeywords?.buildLexerConfig().grammar).toEqual({
      semicolonMode: "optional-eol",
      blockMode: "delimited",
      typingMode: "untyped",
      arrayMode: "fixed",
    });

    expect(capturedKeywords?.setCustomization).toBeTypeOf("function");
    expect(capturedKeywords?.setModes).toBeTypeOf("function");
    expect(capturedKeywords?.setUi).toBeTypeOf("function");

    act(() => {
      root.unmount();
    });
  });

  it("builds the same lexer config shape as the shared helper", () => {
    const customization = getDefaultCustomizationState();
    customization.modes.typing = "untyped";
    customization.modes.array = "dynamic";
    customization.statementTerminatorLexeme = " @@ ";
    customization.blockDelimiters = { open: " inicio ", close: " fim " };

    const helperConfig = buildLexerConfigFromCustomization(customization);

    expect(helperConfig).toMatchObject({
      grammar: {
        semicolonMode: "optional-eol",
        blockMode: "delimited",
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
    });
    expect(capturedKeywords).toBeNull();
  });

  it("normalizes stored flat grammar fields into nested customization modes", () => {
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify({
        mappings: getDefaultKeywordMappings(),
        operatorWordMap: { logical_and: "et" },
        booleanLiteralMap: { true: "verdadeiro", false: "falso" },
        statementTerminatorLexeme: "@@",
        blockDelimiters: { open: "inicio", close: "fim" },
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
        arrayMode: "dynamic",
        ui: { isKeywordCustomizerOpen: true },
      }),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(capturedKeywords?.customization).toMatchObject({
      operatorWordMap: { logical_and: "et" },
      booleanLiteralMap: { true: "verdadeiro", false: "falso" },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
      modes: {
        semicolon: "required",
        block: "indentation",
        typing: "untyped",
        array: "dynamic",
      },
      ui: {
        isKeywordCustomizerOpen: false,
      },
    });

    act(() => {
      root.unmount();
    });
  });

  it("writes normalized nested customization back to localStorage after hydration", () => {
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify({
        mappings: getDefaultKeywordMappings(),
        operatorWordMap: { logical_and: "et" },
        booleanLiteralMap: { true: "verdadeiro", false: "falso" },
        statementTerminatorLexeme: "@@",
        blockDelimiters: { open: "inicio", close: "fim" },
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
        arrayMode: "dynamic",
        ui: { isKeywordCustomizerOpen: true },
      }),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    const persisted = JSON.parse(
      localStorage.getItem("keyword-customization") ?? "{}",
    ) as Record<string, unknown>;

    expect(persisted).toMatchObject({
      operatorWordMap: { logical_and: "et" },
      booleanLiteralMap: { true: "verdadeiro", false: "falso" },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
      modes: {
        semicolon: "required",
        block: "indentation",
        typing: "untyped",
        array: "dynamic",
      },
      ui: {
        isKeywordCustomizerOpen: false,
      },
    });

    expect(persisted).not.toHaveProperty("semicolonMode");
    expect(persisted).not.toHaveProperty("blockMode");
    expect(persisted).not.toHaveProperty("typingMode");
    expect(persisted).not.toHaveProperty("arrayMode");

    act(() => {
      root.unmount();
    });
  });

  it("migrates legacy keyword mappings into the full nested customization state", () => {
    const legacyMappings = getDefaultKeywordMappings().map((mapping) =>
      mapping.original === "print"
        ? { ...mapping, custom: "escreva" }
        : mapping,
    );
    localStorage.setItem("keyword-mappings", JSON.stringify(legacyMappings));

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(capturedKeywords?.customization).toMatchObject({
      mappings: expect.arrayContaining([
        expect.objectContaining({
          original: "print",
          custom: "escreva",
        }),
      ]),
      modes: getDefaultCustomizationState().modes,
      ui: getDefaultCustomizationState().ui,
    });

    act(() => {
      root.unmount();
    });
  });
});

describe("migrateStoredMappings", () => {
  it("preserves older saved mappings and appends bool with its default value", () => {
    const legacyMappings = getDefaultKeywordMappings()
      .filter((mapping) => mapping.original !== "bool")
      .map((mapping) =>
        mapping.original === "int"
          ? { ...mapping, custom: "inteiro" }
          : mapping.original === "print"
            ? { ...mapping, custom: "escreva" }
            : mapping,
      );

    const migrated = migrateStoredMappings(legacyMappings);

    expect(migrated).not.toBeNull();
    const normalizedMigrated = migrated ?? [];

    expect(normalizedMigrated).toHaveLength(getDefaultKeywordMappings().length);
    expect(
      normalizedMigrated.find((mapping) => mapping.original === "int")?.custom,
    ).toBe("inteiro");
    expect(
      normalizedMigrated.find((mapping) => mapping.original === "print")
        ?.custom,
    ).toBe("escreva");
    expect(
      normalizedMigrated.find((mapping) => mapping.original === "bool"),
    ).toEqual({
      original: "bool",
      custom: "bool",
      tokenId: 55,
    });
  });
});

describe("validateCustomKeyword", () => {
  it("allows true when boolean literal aliases are customized away from defaults", () => {
    const error = validateCustomKeyword(
      "int",
      "true",
      getDefaultKeywordMappings(),
      { true: "yes", false: "no" },
    );

    expect(error).toBeNull();
  });

  it("rejects conflicts with the active boolean literal aliases", () => {
    const error = validateCustomKeyword(
      "print",
      "yes",
      getDefaultKeywordMappings(),
      { true: "yes", false: "no" },
    );

    expect(error).toBe('"yes" já está sendo usada como literal booleano.');
  });
});

describe("boolean literal customization", () => {
  it("returns true and false as the default boolean literal aliases", () => {
    expect(getDefaultBooleanLiteralMap()).toEqual({
      true: "true",
      false: "false",
    });
  });

  it("rejects duplicate boolean literal aliases", () => {
    const error = validateBooleanLiteralAliases(
      { true: "sim", false: "sim" },
      getDefaultKeywordMappings(),
      {},
      { open: "", close: "" },
    );

    expect(error).toBe("Os literais booleanos precisam ser diferentes.");
  });

  it("rejects boolean literal aliases that conflict with keyword customizations", () => {
    const mappings = getDefaultKeywordMappings().map((mapping) =>
      mapping.original === "int" ? { ...mapping, custom: "inteiro" } : mapping,
    );

    const error = validateBooleanLiteralAliases(
      { true: "inteiro", false: "falso" },
      mappings,
      {},
      { open: "", close: "" },
    );

    expect(error).toBe(
      '"inteiro" conflicts with an existing keyword customization.',
    );
  });
});

describe("statement terminator customization", () => {
  function createCustomization(
    overrides: Partial<ReturnType<typeof getDefaultCustomizationState>> = {},
  ) {
    return {
      ...getDefaultCustomizationState(),
      ...overrides,
    };
  }

  it("accepts non-conflicting symbolic terminators", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "@@",
      createCustomization(),
    );

    expect(error).toBeNull();
  });

  it("rejects whitespace in statement terminators", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "two words",
      createCustomization(),
    );

    expect(error).toBe("O terminador não pode conter espaços.");
  });

  it("rejects semicolon as a custom statement terminator", () => {
    const error = validateStatementTerminatorLexemeImpl(
      ";",
      createCustomization(),
    );

    expect(error).toBe("Escolha um terminador diferente de ;.");
  });

  it("rejects reserved operator characters in statement terminators", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "!!",
      createCustomization(),
    );

    expect(error).toBe(
      "O terminador não pode reutilizar símbolos ou operadores fixos da linguagem.",
    );
  });

  it("rejects terminators that collide with keyword customizations", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "uai",
      createCustomization({
        mappings: [
          { original: "if", custom: "uai", tokenId: 28 },
          { original: "while", custom: "enquanto", tokenId: 25 },
        ],
      }),
    );

    expect(error).toBe(
      '"uai" conflicts with an existing keyword customization.',
    );
  });

  it("rejects original reserved keywords even after customization remaps them", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "if",
      createCustomization({
        mappings: [{ original: "if", custom: "se", tokenId: 28 }],
      }),
    );

    expect(error).toBe(
      '"if" conflicts with an existing keyword customization.',
    );
  });

  it("rejects terminators that collide with operator aliases", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "uai",
      createCustomization({
        operatorWordMap: { logical_and: "uai" },
      }),
    );

    expect(error).toBe('"uai" conflicts with an existing operator alias.');
  });

  it("rejects terminators that collide with boolean aliases", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "uai",
      createCustomization({
        booleanLiteralMap: { true: "uai", false: "nao" },
      }),
    );

    expect(error).toBe(
      '"uai" conflicts with an existing boolean literal alias.',
    );
  });

  it("rejects default boolean literals even after customization remaps them", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "true",
      createCustomization({
        booleanLiteralMap: { true: "sim", false: "nao" },
      }),
    );

    expect(error).toBe(
      '"true" conflicts with an existing keyword customization.',
    );
  });

  it("rejects terminators that collide with block delimiters", () => {
    const error = validateStatementTerminatorLexemeImpl(
      "uai",
      createCustomization({
        blockDelimiters: { open: "uai", close: "fim" },
      }),
    );

    expect(error).toBe('"uai" conflicts with the configured block delimiters.');
  });
});
