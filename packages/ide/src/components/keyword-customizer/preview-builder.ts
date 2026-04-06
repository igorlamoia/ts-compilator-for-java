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
  const scan = getKeyword(draft, "scan");
  const boolTrue = draft.booleanLiteralMap.true?.trim() || "true";
  const lineEnding = buildLineEnding(draft);

  const baseCodeSnippet = "funcao main() ";

  if (draft.modes.block === "indentation") {
    return `${baseCodeSnippet}${conditional} (${boolTrue}):\n\t${print}("Olá Mundo!")\n${otherwise}:\n\t${print}("Sou mudo")`;
  }

  const open = draft.blockDelimiters.open.trim() || "{";
  const close = draft.blockDelimiters.close.trim() || "}";

  return `${baseCodeSnippet}${open}\n\t${print}("Olá Mundo!")${lineEnding}
  ${scan}(nome)${lineEnding}\n\t${print}("Me chamo:", nome)\n${close}`;
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
