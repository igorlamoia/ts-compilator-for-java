import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { WizardStepId } from "./wizard-model";

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

function buildRequiredLineEnding(draft: StoredKeywordCustomization): string {
  return draft.statementTerminatorLexeme.trim() || ";";
}

export function buildOptionalTerminatorSnippet(
  draft: StoredKeywordCustomization,
): string {
  const print = getKeyword(draft, "print");
  return `${print}("ok")`;
}

export function buildRequiredTerminatorSnippet(
  draft: StoredKeywordCustomization,
): string {
  return `${buildOptionalTerminatorSnippet(draft)}${buildRequiredLineEnding(draft)}`;
}

function buildArrayDeclarationPrefix(draft: StoredKeywordCustomization): string {
  if (draft.modes.typing === "untyped") {
    return "";
  }

  return `${getKeyword(draft, "string")} `;
}

export function buildFixedArraySnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const prefix = buildArrayDeclarationPrefix(draft);
  return `${prefix}animes[2] = ["Naruto", "AOT"]${lineEnding}`;
}

export function buildDynamicArraySnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const prefix = buildArrayDeclarationPrefix(draft);
  return `${prefix}animes[] = ["Naruto", "AOT"]${lineEnding}`;
}

export function untypedVariableSnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const variable = getKeyword(draft, "variavel");
  return `${variable} nome = "Kiki"${lineEnding}\n${variable} idade = 25${lineEnding}\n${variable} altura = 1.75${lineEnding}\n${variable} estudante = true${lineEnding}`;
}
export function typedVariableSnippet(
  draft: StoredKeywordCustomization,
): string {
  const lineEnding = buildLineEnding(draft);
  const stringType = getKeyword(draft, "string");
  const intType = getKeyword(draft, "int");
  const floatType = getKeyword(draft, "float");
  const boolType = getKeyword(draft, "bool");
  return `${stringType} nome = "Kiki"${lineEnding}\n${intType} idade = 25${lineEnding}\n${floatType} altura = 1.75${lineEnding}\n${boolType} estudante = true${lineEnding}`;
}
export function buildVariableSnippet(
  draft: StoredKeywordCustomization,
): string {
  if (draft.modes.typing === "untyped") return untypedVariableSnippet(draft);
  return typedVariableSnippet(draft);
}

export function buildIdentationSnippet(
  draft: StoredKeywordCustomization,
): string {
  const conditional = getKeyword(draft, "if");
  const otherwise = getKeyword(draft, "else");
  const print = getKeyword(draft, "print");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const lineEnding = buildLineEnding(draft);
  const funcao = getKeyword(draft, "funcao");

  const baseCodeSnippet = `${funcao} main()`;

  return `${baseCodeSnippet}:\n\t${conditional} (${boolTrue}):\n\t\t${print}("Olá Mundo!")\n\t${otherwise}:\n\t\t${print}("Sou mudo")`;
}

export function buildDelimiterSnippet(
  draft: StoredKeywordCustomization,
): string {
  const print = getKeyword(draft, "print");
  const scan = getKeyword(draft, "scan");
  const lineEnding = buildLineEnding(draft);
  const funcao = getKeyword(draft, "funcao");
  const baseCodeSnippet = `${funcao} main()`;

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${baseCodeSnippet}${open}\n\t${print}("Olá Mundo!")${lineEnding}
  ${scan}(nome)${lineEnding}\n\t${print}("Me chamo:", nome)\n${close}`;
}

export function buildBlockSnippet(draft: StoredKeywordCustomization): string {
  if (draft.modes.block === "indentation") return buildIdentationSnippet(draft);
  return buildDelimiterSnippet(draft);
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

export function buildPreviewSource(
  draft: StoredKeywordCustomization,
  activeStepId: WizardStepId,
): string {
  if (activeStepId === "types") {
    return buildVariableSnippet(draft);
  }

  if (activeStepId === "flow") {
    return buildFlowSnippet(draft);
  }

  return buildBlockSnippet(draft);
}
