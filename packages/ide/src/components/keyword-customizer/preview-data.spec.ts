import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { buildWizardPreview } from "./preview-data";

describe("buildWizardPreview", () => {
  it("uses the current draft mappings in the live example and token summary", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((item) =>
      item.original === "print" ? { ...item, custom: "escreva" } : item,
    );
    draft.mappings = draft.mappings.map((item) =>
      item.original === "if" ? { ...item, custom: "se" } : item,
    );
    draft.booleanLiteralMap = { true: "sim", false: "nao" };

    const preview = buildWizardPreview(draft, {
      activeStepId: "variables",
      presetId: "didactic-pt",
    });

    expect(preview.languageLabel).toBe("Didatica em Portugues");
    expect(preview.dna).toContain("blocos com delimitadores");
    expect(preview.snippet).toContain('string nome = "Ana"');
    expect(preview.snippet).toContain("escreva(nome)");
    expect(preview.tokenPreview.map((token) => token.lexeme)).toContain(
      "escreva",
    );
  });

  it("switches to an indentation example when the draft block mode changes", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.block = "indentation";

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "free",
    });

    expect(preview.snippet).toContain(":");
    expect(preview.snippet).not.toContain("{");
  });
});
