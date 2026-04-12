import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { buildStructureStepProps } from "./keyword-customizer-step-props";

describe("buildStructureStepProps", () => {
  it("fills the structure snippets from the draft", () => {
    const draft = getDefaultCustomizationState();
    const context = {
      draftCustomization: draft,
      preview: { snippet: "live-preview" },
      errors: {
        delimiterError: null,
        statementTerminatorError: null,
        booleanLiteralError: null,
        operatorError: null,
      },
      visitedStepIds: [],
      selectedPresetId: "free",
      languageName: "",
      languageImageUrl: "",
      languageImageQuery: "",
      languageImageResults: [],
      isSearchingLanguageImages: false,
      languageImageSearchError: null,
      hasChanges: false,
      activeStep: "structure",
      activeStepIndex: 0,
      visibleSteps: [],
      form: {} as never,
      actions: {
        goToWizardStep: () => undefined,
        goToNextWizardStep: () => undefined,
        goToPreviousWizardStep: () => undefined,
        applyPreset: () => undefined,
        setLanguageName: () => undefined,
        setImageSearchQuery: () => undefined,
        searchLanguageImages: async () => undefined,
        selectLanguageImage: () => undefined,
        resetDraft: () => undefined,
        save: () => undefined,
        exit: () => undefined,
        syncKeyword: () => undefined,
        syncDocumentation: () => undefined,
        syncMode: () => undefined,
        syncDelimiter: () => undefined,
        syncBooleanLiteral: () => undefined,
        syncOperatorWord: () => undefined,
        syncStatementTerminator: () => undefined,
      },
    } as never;

    const props = buildStructureStepProps(context);

    expect(props.values.delimiterSnippet).toContain("funcao main()");
    expect(props.values.identationSnippet).toContain("funcao main():");
  });
});
