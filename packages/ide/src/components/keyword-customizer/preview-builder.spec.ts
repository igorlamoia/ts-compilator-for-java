import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  typedVariableSnippet,
  untypedVariableSnippet,
} from "./preview-builder";

describe("preview-builder variable snippets", () => {
  function createDraft() {
    return {
      ...getDefaultCustomizationState(),
      mappings: getDefaultCustomizationState().mappings.map((mapping) => {
        if (mapping.original === "variavel") {
          return { ...mapping, custom: "var" };
        }

        if (mapping.original === "int") {
          return { ...mapping, custom: "numero" };
        }

        if (mapping.original === "float") {
          return { ...mapping, custom: "decimal" };
        }

        if (mapping.original === "bool") {
          return { ...mapping, custom: "logico" };
        }

        if (mapping.original === "string") {
          return { ...mapping, custom: "texto" };
        }

        return mapping;
      }),
      modes: {
        ...getDefaultCustomizationState().modes,
        semicolon: "required",
        typing: "typed" as const,
      },
      statementTerminatorLexeme: "fim",
    };
  }

  it("builds the typed example from the draft", () => {
    const draft = createDraft();

    expect(typedVariableSnippet(draft)).toBe(
      'texto nome = "Kiki"fim\nnumero idade = 25fim\ndecimal altura = 1.75fim\nlogico estudante = truefim',
    );
  });

  it("builds the untyped example from the draft", () => {
    const draft = createDraft();
    draft.modes.typing = "untyped";

    expect(untypedVariableSnippet(draft)).toBe(
      'var nome = "Kiki"fim\nvar idade = 25fim\nvar altura = 1.75fim\nvar estudante = truefim',
    );
  });
});
