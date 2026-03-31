import { Lexer } from "@ts-compilator-for-java/compiler/src/lexer";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { buildEffectiveKeywordMap } from "@/lib/keyword-map";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
} from "@/lib/keyword-map";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import {
  WIZARD_PRESET_LABELS,
  type WizardPresetId,
  type WizardStepId,
} from "./wizard-model";

export type BuildPreviewOptions = {
  activeStepId: WizardStepId;
  presetId: WizardPresetId;
};

type PreviewToken = {
  lexeme: string;
  type: number;
};

type PreviewLexemeChange = {
  original: string;
  custom: string;
};

export type WizardPreview = {
  languageLabel: string;
  dna: string[];
  snippet: string;
  tokenPreview: PreviewToken[];
  chosenLexemes: PreviewLexemeChange[];
};

function getKeyword(
  draft: StoredKeywordCustomization,
  original: string,
): string {
  return (
    draft.mappings.find((item) => item.original === original)?.custom ??
    original
  );
}

function buildLineEnding(draft: StoredKeywordCustomization): string {
  if (draft.modes.semicolon !== "required") {
    return "";
  }

  return draft.statementTerminatorLexeme.trim() || ";";
}

function buildVariableSnippet(draft: StoredKeywordCustomization): string {
  const lineEnding = buildLineEnding(draft);
  const print = getKeyword(draft, "print");

  if (draft.modes.typing === "untyped") {
    const variable = getKeyword(draft, "variavel");
    return `${variable} nome = "Ana"${lineEnding}\n${print}(nome)${lineEnding}`;
  }

  const stringType = getKeyword(draft, "string");
  return `${stringType} nome = "Ana"${lineEnding}\n${print}(nome)${lineEnding}`;
}

function buildBlockSnippet(draft: StoredKeywordCustomization): string {
  const conditional = getKeyword(draft, "if");
  const otherwise = getKeyword(draft, "else");
  const print = getKeyword(draft, "print");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const lineEnding = buildLineEnding(draft);

  if (draft.modes.block === "indentation") {
    return `${conditional} (${boolTrue}):\n\t${print}("ok")\n${otherwise}:\n\t${print}("fim")`;
  }

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${conditional} (${boolTrue}) ${open}\n  ${print}("ok")${lineEnding}\n${close} ${otherwise} ${open}\n  ${print}("fim")${lineEnding}\n${close}`;
}

function buildFlowSnippet(draft: StoredKeywordCustomization): string {
  const loop = getKeyword(draft, "while");
  const print = getKeyword(draft, "print");
  const returnKeyword = getKeyword(draft, "return");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const lineEnding = buildLineEnding(draft);

  if (draft.modes.block === "indentation") {
    return `${loop} (${boolTrue}):\n\t${print}("processando")\n\t${returnKeyword} valor`;
  }

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${loop} (${boolTrue}) ${open}\n  ${print}("processando")${lineEnding}\n  ${returnKeyword} valor${lineEnding}\n${close}`;
}

function buildPreviewSource(
  draft: StoredKeywordCustomization,
  activeStepId: WizardStepId,
): string {
  if (activeStepId === "variables") {
    return buildVariableSnippet(draft);
  }

  if (activeStepId === "flow") {
    return buildFlowSnippet(draft);
  }

  return buildBlockSnippet(draft);
}

function tokenizePreview(
  draft: StoredKeywordCustomization,
  snippet: string,
): PreviewToken[] {
  const config = buildLexerConfigFromCustomization(draft);

  try {
    return new Lexer(snippet, {
      customKeywords: buildEffectiveKeywordMap(config.keywordMap),
      operatorWordMap: config.operatorWordMap,
      booleanLiteralMap: config.booleanLiteralMap,
      statementTerminatorLexeme: config.statementTerminatorLexeme,
      blockDelimiters: config.blockDelimiters,
      indentationBlock: config.indentationBlock,
    })
      .scanTokens()
      .slice(0, 8)
      .map((token) => ({
        lexeme: token.lexeme,
        type: token.type,
      }));
  } catch {
    return [];
  }
}

function collectPreviewLexemeChanges(
  draft: StoredKeywordCustomization,
): PreviewLexemeChange[] {
  const keywordChanges = draft.mappings
    .filter((item) => item.custom !== item.original)
    .map((item) => ({ original: item.original, custom: item.custom }));

  const operatorWordChanges = (
    Object.keys(DEFAULT_OPERATOR_WORD_MAP) as Array<
      keyof typeof DEFAULT_OPERATOR_WORD_MAP
    >
  ).flatMap((key) => {
    const original = DEFAULT_OPERATOR_WORD_MAP[key]?.trim();
    const custom = draft.operatorWordMap[key]?.trim();

    if (!original || !custom || custom === original) {
      return [];
    }

    return [{ original, custom }];
  });

  const booleanLiteralChanges = (
    Object.keys(DEFAULT_BOOLEAN_LITERAL_MAP) as Array<
      keyof typeof DEFAULT_BOOLEAN_LITERAL_MAP
    >
  ).flatMap((key) => {
    const original = DEFAULT_BOOLEAN_LITERAL_MAP[key]?.trim();
    const custom = draft.booleanLiteralMap[key]?.trim();

    if (!original || !custom || custom === original) {
      return [];
    }

    return [{ original, custom }];
  });

  const statementTerminator = draft.statementTerminatorLexeme.trim();
  const statementTerminatorChange =
    statementTerminator && statementTerminator !== ";"
      ? [{ original: ";", custom: statementTerminator }]
      : [];

  const blockOpen = draft.blockDelimiters.open.trim();
  const blockClose = draft.blockDelimiters.close.trim();
  const blockDelimiterChanges: PreviewLexemeChange[] = [];

  if (blockOpen && blockOpen !== "{") {
    blockDelimiterChanges.push({ original: "{", custom: blockOpen });
  }

  if (blockClose && blockClose !== "}") {
    blockDelimiterChanges.push({ original: "}", custom: blockClose });
  }

  return [
    ...keywordChanges,
    ...operatorWordChanges,
    ...booleanLiteralChanges,
    ...statementTerminatorChange,
    ...blockDelimiterChanges,
  ];
}

export function buildWizardPreview(
  draft: StoredKeywordCustomization,
  options: BuildPreviewOptions,
): WizardPreview {
  const snippet = buildPreviewSource(draft, options.activeStepId);

  return {
    languageLabel: WIZARD_PRESET_LABELS[options.presetId],
    dna: [
      draft.modes.typing === "typed" ? "tipada" : "nao tipada",
      draft.modes.block === "delimited"
        ? "blocos com delimitadores"
        : "blocos por indentacao",
      draft.modes.semicolon === "required"
        ? "terminador obrigatorio"
        : "fim de linha opcional",
    ],
    snippet,
    tokenPreview: tokenizePreview(draft, snippet),
    chosenLexemes: collectPreviewLexemeChanges(draft),
  };
}
