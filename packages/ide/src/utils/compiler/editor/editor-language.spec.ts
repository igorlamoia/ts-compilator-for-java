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
      { original: "print", custom: "escreva", tokenId: 33 },
    ]);

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["se", "enquanto", "inteiro", "escreva"]),
    );
    expect(metadata.semanticGroups.conditionals).toContain("se");
    expect(metadata.semanticGroups.loops).toContain("enquanto");
    expect(metadata.semanticGroups.types).toContain("inteiro");
    expect(metadata.semanticGroups.io).toContain("escreva");
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
});
