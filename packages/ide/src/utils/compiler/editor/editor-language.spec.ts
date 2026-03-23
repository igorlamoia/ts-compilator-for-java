import { describe, expect, it, vi } from "vitest";
import {
  buildJavaMMLanguageMetadata,
  buildJavaMMMonarchLanguage,
  registerJavaMMLanguage,
} from "@/utils/compiler/editor/editor-language";

describe("buildJavaMMLanguageMetadata", () => {
  it("maps customized words into semantic keyword groups", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "if", custom: "se", tokenId: 28 },
      { original: "while", custom: "enquanto", tokenId: 25 },
      { original: "int", custom: "inteiro", tokenId: 21 },
      { original: "bool", custom: "logico", tokenId: 55 },
      { original: "print", custom: "escreva", tokenId: 33 },
    ]);

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["se", "enquanto", "inteiro", "logico", "escreva"]),
    );
    expect(metadata.semanticGroups.conditionals).toContain("se");
    expect(metadata.semanticGroups.loops).toContain("enquanto");
    expect(metadata.semanticGroups.types).toContain("inteiro");
    expect(metadata.semanticGroups.types).toContain("logico");
    expect(metadata.semanticGroups.io).toContain("escreva");
  });

  it("includes built-in boolean literals in metadata", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "bool", custom: "bool", tokenId: 55 },
    ]);

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["bool", "true", "false"]),
    );
  });

  it("uses configured boolean literals in metadata instead of the built-in defaults", () => {
    const metadata = buildJavaMMLanguageMetadata(
      [{ original: "bool", custom: "bool", tokenId: 55 }],
      {},
      { true: "yes", false: "no" },
    );

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["bool", "yes", "no"]),
    );
    expect(metadata.allKeywords).not.toEqual(
      expect.arrayContaining(["true", "false"]),
    );
  });

  it("assigns semantic Monaco token classes", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "if", custom: "se", tokenId: 28 },
      { original: "while", custom: "enquanto", tokenId: 25 },
      { original: "int", custom: "inteiro", tokenId: 21 },
    ]);

    const language = buildJavaMMMonarchLanguage(metadata);
    const rootTokenizer = language.tokenizer.root[0];

    if (!Array.isArray(rootTokenizer) || !("cases" in rootTokenizer[1])) {
      throw new Error("Unexpected Monarch tokenizer shape");
    }

    expect(rootTokenizer[1].cases["@conditionals"]).toBe("keyword.conditional");
    expect(rootTokenizer[1].cases["@loops"]).toBe("keyword.loop");
    expect(rootTokenizer[1].cases["@types"]).toBe("keyword.type");
  });

  it("preserves semantic meaning after keyword customization", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(monaco as never, [
      { original: "return", custom: "retorne", tokenId: 30 },
      { original: "scan", custom: "leia", tokenId: 35 },
      { original: "switch", custom: "escolha", tokenId: 50 },
    ] as never);

    const language = monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];

    expect(language.flow).toContain("retorne");
    expect(language.io).toContain("leia");
    expect(language.conditionals).toContain("escolha");
  });

  it("includes configured operator aliases in Monarch operators", () => {
    const metadata = buildJavaMMLanguageMetadata(
      [{ original: "if", custom: "if", tokenId: 28 }],
      { logical_and: "and", less_equal: "less_equal" },
    );

    expect(metadata.operatorWords).toEqual(
      expect.arrayContaining(["and", "less_equal"]),
    );
  });

  it("registers operator alias words in the Monaco language", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "if", custom: "if", tokenId: 28 }] as never,
      {
        operatorWordMap: { logical_and: "and" },
      } as never,
    );

    const language = monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];

    expect(language.operators).toContain("and");
  });

  it("uses custom block delimiters in Monaco language configuration", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "if", custom: "se", tokenId: 28 }] as never,
      {
        blockMode: "delimited",
        blockDelimiters: { open: "inicio", close: "fim" },
      } as never,
    );

    const config = monaco.languages.setLanguageConfiguration.mock.calls[0]?.[1];

    expect(config.brackets).toContainEqual(["inicio", "fim"]);
    expect(config.autoClosingPairs).toContainEqual({
      open: "inicio",
      close: "fim",
    });
    expect(config.surroundingPairs).toContainEqual({
      open: "inicio",
      close: "fim",
    });
  });

  it("offers configured boolean literals in autocomplete", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
          Value: 4,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "bool", custom: "bool", tokenId: 55 }] as never,
      {
        booleanLiteralMap: { true: "yes", false: "no" },
        typingMode: "typed",
        blockMode: "delimited",
        arrayMode: "fixed",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const labels = result.suggestions.map(
      (suggestion: { label: string }) => suggestion.label,
    );

    expect(labels).toEqual(expect.arrayContaining(["yes", "no"]));
    expect(labels).not.toEqual(expect.arrayContaining(["true", "false"]));
  });

  it("filters typed fixed array snippets by array mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "int", custom: "int", tokenId: 21 }] as never,
      {
        typingMode: "typed",
        blockMode: "delimited",
        arrayMode: "fixed",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("int ${1:vetor}[${2:10}];");
    expect(suggestionTexts).toContain("int ${1:matriz}[${2:3}][${3:3}];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[];");
    expect(suggestionTexts).not.toContain("int ${1:matriz}[][];");
  });

  it("filters typed dynamic array snippets by array mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "int", custom: "int", tokenId: 21 }] as never,
      {
        typingMode: "typed",
        blockMode: "delimited",
        arrayMode: "dynamic",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("int ${1:vetor}[];");
    expect(suggestionTexts).toContain("int ${1:matriz}[][];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[${2:10}];");
  });

  it("shows only dynamic array snippets in untyped mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [
        { original: "int", custom: "int", tokenId: 21 },
        { original: "variavel", custom: "variavel", tokenId: 53 },
      ] as never,
      {
        typingMode: "untyped",
        blockMode: "delimited",
        arrayMode: "dynamic",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("variavel ${1:lista}[] = [];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[${2:10}];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[];");
  });
});
