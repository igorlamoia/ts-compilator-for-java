import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  WIZARD_STEPS,
  applyWizardPreset,
  getWizardStepFields,
} from "./wizard-model";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";

describe("wizard-model", () => {
  it("keeps the step order from the spec", () => {
    expect(WIZARD_STEPS.map((step) => step.id)).toEqual([
      "identity",
      "output",
      "variables",
      "structure",
      "rules",
      "flow",
      "review",
    ]);
  });

  it("maps current persisted fields into the output step", () => {
    expect(getWizardStepFields("output")).toEqual([
      "print",
      "scan",
      "statementTerminatorLexeme",
      "modes.semicolon",
    ]);
  });

  it("applies a didactic preset without adding new persisted keys", () => {
    const base = getDefaultCustomizationState();
    const next = applyWizardPreset(base, "didactic-pt");

    expect(next.mappings.find((item) => item.original === "if")?.custom).toBe(
      "se",
    );
    expect(next.mappings.find((item) => item.original === "else")?.custom).toBe(
      "senao",
    );
    expect(Object.keys(next).sort()).toEqual(Object.keys(base).sort());
  });
});

describe("buildLexerConfigFromCustomization", () => {
  it("normalizes the draft into the same grammar payload shape used today", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.typing = "untyped";
    draft.modes.array = "dynamic";
    draft.blockDelimiters = { open: " inicio ", close: " fim " };
    draft.statementTerminatorLexeme = " @@ ";

    expect(buildLexerConfigFromCustomization(draft)).toMatchObject({
      grammar: {
        semicolonMode: draft.modes.semicolon,
        blockMode: draft.modes.block,
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
    });
  });
});
