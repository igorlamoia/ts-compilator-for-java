import { describe, expect, it } from "vitest";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  getActiveWizardStepError,
  getValidationErrorForWizardStep,
  resolveStepAfterKeywordValidationFailure,
} from "./keyword-customizer-validation";

function createCustomization(
  overrides: Partial<StoredKeywordCustomization> = {},
): StoredKeywordCustomization {
  return {
    ...getDefaultCustomizationState(),
    ...overrides,
  };
}

describe("keyword-customizer-validation", () => {
  it("prefers the structure-specific errors over the generic keyword error in the structure step", () => {
    const error = getActiveWizardStepError("structure", {
      currentError: "Palavra reservada invalida",
      delimiterError: "Delimitadores invalidos",
      statementTerminatorError: "Terminador invalido",
      booleanLiteralError: null,
      operatorError: null,
    });

    expect(error).toBe("Delimitadores invalidos");
  });

  it("prefers the rules-specific errors over the generic keyword error in the rules step", () => {
    const error = getActiveWizardStepError("rules", {
      currentError: "Palavra reservada invalida",
      delimiterError: null,
      statementTerminatorError: null,
      booleanLiteralError: "Booleano invalido",
      operatorError: "Operador invalido",
    });

    expect(error).toBe("Booleano invalido");
  });

  it("blocks advancement from the structure step when any structure validation error exists", () => {
    const result = getValidationErrorForWizardStep("structure", {
      draftCustomization: createCustomization(),
      currentError: null,
      delimiterError: "Delimitadores invalidos",
      statementTerminatorError: null,
      booleanLiteralError: null,
      operatorError: null,
    });

    expect(result).toBe("Delimitadores invalidos");
  });

  it("routes save failures back to the wizard step that owns the invalid keyword", () => {
    expect(resolveStepAfterKeywordValidationFailure("if")).toBe("flow");
    expect(resolveStepAfterKeywordValidationFailure("void")).toBe("structure");
    expect(resolveStepAfterKeywordValidationFailure("print")).toBe("variables");
    expect(resolveStepAfterKeywordValidationFailure("qualquer-coisa")).toBe(
      "identity",
    );
  });
});
