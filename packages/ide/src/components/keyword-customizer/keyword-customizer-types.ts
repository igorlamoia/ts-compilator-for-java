import type { UseFormReturn } from "react-hook-form";
import type {
  IDEBooleanLiteralMap,
  IDEKeywordCustomizationModes,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import type {
  BlockDelimiters,
  StoredKeywordCustomization,
} from "@/contexts/keyword/types";
import type { WizardPreview } from "./preview-data";
import type {
  WizardPresetId,
  WizardStepId,
  WIZARD_STEPS,
} from "./wizard-model";
import type { KeywordCustomizerErrorState } from "./keyword-customizer-validation";

export type WizardStep = (typeof WIZARD_STEPS)[number];

export type KeywordCustomizerSyncActions = {
  syncKeyword: (original: string, value: string) => void;
  syncDocumentation: (id: string, value: string) => void;
  syncMode: <K extends keyof IDEKeywordCustomizationModes>(
    key: K,
    value: IDEKeywordCustomizationModes[K],
  ) => void;
  syncDelimiter: (field: keyof BlockDelimiters, value: string) => void;
  syncBooleanLiteral: (
    field: keyof IDEBooleanLiteralMap,
    value: string,
  ) => void;
  syncOperatorWord: (field: keyof IDEOperatorWordMap, value: string) => void;
  syncStatementTerminator: (value: string) => void;
};

export type KeywordCustomizerWizardActions = {
  goToWizardStep: (stepId: WizardStepId) => void;
  goToNextWizardStep: () => void;
  goToPreviousWizardStep: () => void;
  applyPreset: (presetId: WizardPresetId) => void;
  resetDraft: () => void;
  save: () => void;
  exit: () => void;
};

export type KeywordCustomizerContextValue = {
  form: UseFormReturn<StoredKeywordCustomization>;
  draftCustomization: StoredKeywordCustomization;
  preview: WizardPreview;
  errors: KeywordCustomizerErrorState;
  activeStep: WizardStep;
  activeStepIndex: number;
  visibleSteps: readonly WizardStep[];
  visitedStepIds: WizardStepId[];
  selectedPresetId: WizardPresetId;
  hasChanges: boolean;
  actions: KeywordCustomizerSyncActions & KeywordCustomizerWizardActions;
};
