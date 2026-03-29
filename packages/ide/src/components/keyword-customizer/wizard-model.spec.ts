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
      "variables",
      "structure",
      "rules",
      "flow",
      "review",
    ]);
  });

  it("maps current persisted fields into the merged variables step", () => {
    expect(getWizardStepFields("variables")).toEqual([
      "print",
      "scan",
      "int",
      "float",
      "bool",
      "string",
      "variavel",
      "modes.typing",
      "modes.array",
    ]);
  });

  it("maps terminator and semicolon controls into the structure step", () => {
    expect(getWizardStepFields("structure")).toEqual([
      "statementTerminatorLexeme",
      "modes.semicolon",
      "void",
      "funcao",
      "modes.block",
      "blockDelimiters",
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

  it("resets back to a clean base for traditional and free presets", () => {
    const base = getDefaultCustomizationState();
    const mutated = {
      ...base,
      mappings: base.mappings.map((item) =>
        item.original === "print"
          ? { ...item, custom: "escreva" }
          : item.original === "return"
            ? { ...item, custom: "entregue" }
            : item,
      ),
      operatorWordMap: { ...base.operatorWordMap, plus: "mais" },
      statementTerminatorLexeme: ";",
    };

    const free = applyWizardPreset(mutated, "free");
    const traditional = applyWizardPreset(mutated, "traditional");

    expect(free.mappings.find((item) => item.original === "print")?.custom).toBe(
      "print",
    );
    expect(free.mappings.find((item) => item.original === "return")?.custom).toBe(
      "return",
    );
    expect(free.operatorWordMap).toEqual({});
    expect(free.statementTerminatorLexeme).toBe("");

    expect(
      traditional.mappings.find((item) => item.original === "print")?.custom,
    ).toBe("print");
    expect(
      traditional.mappings.find((item) => item.original === "return")?.custom,
    ).toBe("return");
    expect(traditional.operatorWordMap).toEqual({});
    expect(traditional.statementTerminatorLexeme).toBe("");
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
