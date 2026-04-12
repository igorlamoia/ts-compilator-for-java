import {
  getBooleanDocumentationId,
  getKeywordDocumentationId,
  getOperatorDocumentationId,
} from "@/lib/language-documentation";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";
import type { KeywordCustomizerContextValue } from "./keyword-customizer-types";
import type { IdentityStepProps } from "./steps/identity-step";
import type { FlowStepProps } from "./steps/flow-step";
import type { ReviewStepProps } from "./steps/review-step";
import type { RulesStepProps } from "./steps/rules-step";
import type { StructureStepProps } from "./steps/structure-step";
import type { VariablesStepProps } from "./steps/io-step";
import {
  buildDelimiterSnippet,
  buildIdentationSnippet,
  typedVariableSnippet,
  untypedVariableSnippet,
} from "./preview-builder";

function getKeywordValue(
  context: KeywordCustomizerContextValue,
  original: string,
): string {
  return (
    context.draftCustomization.mappings.find(
      (mapping) => mapping.original === original,
    )?.custom ?? original
  );
}

function getKeywordDescription(
  context: KeywordCustomizerContextValue,
  original: string,
): string {
  return (
    context.draftCustomization.languageDocumentation[
      getKeywordDocumentationId(original)
    ]?.description ?? ""
  );
}

export function buildIdentityStepProps(
  context: KeywordCustomizerContextValue,
): IdentityStepProps {
  return {
    values: {
      selectedPresetId: context.selectedPresetId,
      languageName: context.languageName,
      imageSearchQuery: context.languageImageQuery,
      imageSearchResults: context.languageImageResults,
      selectedImageUrl: context.languageImageUrl,
      isSearchingImages: context.isSearchingLanguageImages,
      imageSearchError: context.languageImageSearchError,
    },
    actions: {
      selectPreset: context.actions.applyPreset,
      setLanguageName: context.actions.setLanguageName,
      setImageSearchQuery: context.actions.setImageSearchQuery,
      searchImages: context.actions.searchLanguageImages,
      selectImage: context.actions.selectLanguageImage,
    },
  };
}

export function buildVariablesStepProps(
  context: KeywordCustomizerContextValue,
): VariablesStepProps {
  const variableKeywords =
    context.draftCustomization.modes.typing === "untyped"
      ? (["variavel"] as const)
      : (["int", "float", "bool", "string"] as const);

  return {
    values: {
      snippet: context.preview.snippet,
      typedSnippet: typedVariableSnippet(context.draftCustomization),
      untypedSnippet: untypedVariableSnippet(context.draftCustomization),
      typingMode: context.draftCustomization.modes.typing,
      arrayMode: context.draftCustomization.modes.array,
      printKeyword: getKeywordValue(context, "print"),
      printDescription: getKeywordDescription(context, "print"),
      scanKeyword: getKeywordValue(context, "scan"),
      scanDescription: getKeywordDescription(context, "scan"),
      typingBeamKeywords: {
        variavel: getKeywordValue(context, "variavel"),
        string: getKeywordValue(context, "string"),
        float: getKeywordValue(context, "float"),
        int: getKeywordValue(context, "int"),
        void: getKeywordValue(context, "void"),
      },
      variableKeywords: variableKeywords.map((key) => ({
        key,
        value: getKeywordValue(context, key),
        description: getKeywordDescription(context, key),
      })),
    },
    actions: {
      syncTypingMode: (mode) => context.actions.syncMode("typing", mode),
      syncArrayMode: (mode) => context.actions.syncMode("array", mode),
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildStructureStepProps(
  context: KeywordCustomizerContextValue,
): StructureStepProps {
  const structureKeywords = ["void", "funcao"] as const;
  const { draftCustomization } = context;

  return {
    values: {
      snippet: context.preview.snippet,
      delimiterSnippet: buildDelimiterSnippet(context.draftCustomization),
      identationSnippet: buildIdentationSnippet(context.draftCustomization),
      semicolonMode: draftCustomization.modes.semicolon,
      blockMode: draftCustomization.modes.block,
      usesCustomDelimiters:
        draftCustomization.blockDelimiters.open.trim().length > 0 ||
        draftCustomization.blockDelimiters.close.trim().length > 0,
      statementTerminator: {
        value: draftCustomization.statementTerminatorLexeme,
        description:
          draftCustomization.languageDocumentation["terminator.statement"]
            ?.description ?? "",
      },
      keywords: structureKeywords.map((key) => ({
        key,
        value: getKeywordValue(context, key),
        description: getKeywordDescription(context, key),
      })),
      delimiters: {
        open: {
          value: draftCustomization.blockDelimiters.open,
          description:
            draftCustomization.languageDocumentation["delimiter.open"]
              ?.description ?? "",
        },
        close: {
          value: draftCustomization.blockDelimiters.close,
          description:
            draftCustomization.languageDocumentation["delimiter.close"]
              ?.description ?? "",
        },
      },
    },
    errors: {
      delimiter: context.errors.delimiterError,
      statementTerminator: context.errors.statementTerminatorError,
    },
    actions: {
      syncBlockMode: (mode) => context.actions.syncMode("block", mode),
      syncDelimiter: context.actions.syncDelimiter,
      syncDelimiterDescription: (field, value) =>
        context.actions.syncDocumentation(
          field === "open" ? "delimiter.open" : "delimiter.close",
          value,
        ),
      syncStatementTerminator: context.actions.syncStatementTerminator,
      syncStatementTerminatorDescription: (value) =>
        context.actions.syncDocumentation("terminator.statement", value),
      syncSemicolonMode: (mode) => context.actions.syncMode("semicolon", mode),
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildRulesStepProps(
  context: KeywordCustomizerContextValue,
): RulesStepProps {
  return {
    values: {
      booleanLiterals: (["true", "false"] as const).map((key) => ({
        key,
        label: `Literal ${key}`,
        value: context.draftCustomization.booleanLiteralMap[key] ?? "",
        description:
          context.draftCustomization.languageDocumentation[
            getBooleanDocumentationId(key)
          ]?.description ?? "",
      })),
      operatorAliases: OPERATOR_WORD_FIELDS.map((field) => ({
        key: field.key,
        label: field.label,
        value: context.draftCustomization.operatorWordMap[field.key] ?? "",
        description:
          context.draftCustomization.languageDocumentation[
            getOperatorDocumentationId(field.key)
          ]?.description ?? "",
        placeholder: field.symbol,
      })),
    },
    errors: {
      booleanLiteral: context.errors.booleanLiteralError,
      operator: context.errors.operatorError,
    },
    actions: {
      syncBooleanLiteral: context.actions.syncBooleanLiteral,
      syncOperatorAlias: context.actions.syncOperatorWord,
      syncBooleanLiteralDescription: (field, value) =>
        context.actions.syncDocumentation(
          getBooleanDocumentationId(field),
          value,
        ),
      syncOperatorAliasDescription: (field, value) =>
        context.actions.syncDocumentation(
          getOperatorDocumentationId(field),
          value,
        ),
    },
  };
}

const FLOW_FIELDS = [
  "if",
  "else",
  "while",
  "for",
  "return",
  "break",
  "continue",
  "switch",
  "case",
  "default",
] as const;

export function buildFlowStepProps(
  context: KeywordCustomizerContextValue,
): FlowStepProps {
  return {
    values: {
      snippet: context.preview.snippet,
      fields: FLOW_FIELDS.map((key) => ({
        key,
        value: getKeywordValue(context, key),
        description: getKeywordDescription(context, key),
      })),
      currentVocabulary: FLOW_FIELDS.map((key) =>
        getKeywordValue(context, key),
      ),
    },
    actions: {
      syncKeyword: (original, value) =>
        context.actions.syncKeyword(original, value),
      syncKeywordDescription: (original, value) =>
        context.actions.syncDocumentation(
          getKeywordDocumentationId(original),
          value,
        ),
    },
  };
}

export function buildReviewStepProps(
  context: KeywordCustomizerContextValue,
): ReviewStepProps {
  return {
    values: {
      preview: context.preview,
      editedMappings: context.draftCustomization.mappings
        .filter((mapping) => mapping.custom !== mapping.original)
        .map((mapping) => ({
          original: mapping.original,
          custom: mapping.custom,
        })),
      visitedStepIds: context.visitedStepIds,
    },
    actions: {
      selectStep: context.actions.goToWizardStep,
    },
  };
}
