import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { IDECompilerConfigPayload } from "@/entities/compiler-config";
import { validateBlockDelimiters } from "@/contexts/keyword/keyword-validator";

type NormalizableCustomization = Pick<
  StoredKeywordCustomization,
  | "mappings"
  | "operatorWordMap"
  | "booleanLiteralMap"
  | "statementTerminatorLexeme"
  | "blockDelimiters"
  | "modes"
>;

export function normalizeCustomizationDraft(
  draft: NormalizableCustomization,
): NormalizableCustomization {
  return {
    ...draft,
    booleanLiteralMap: {
      true: draft.booleanLiteralMap.true?.trim() ?? "",
      false: draft.booleanLiteralMap.false?.trim() ?? "",
    },
    statementTerminatorLexeme: draft.statementTerminatorLexeme.trim(),
    blockDelimiters: {
      open: draft.blockDelimiters.open.trim(),
      close: draft.blockDelimiters.close.trim(),
    },
  };
}

export function buildLexerConfigFromCustomization(
  customization: StoredKeywordCustomization,
): IDECompilerConfigPayload {
  const normalized = normalizeCustomizationDraft(customization);
  const keywordMap = normalized.mappings.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.custom] = item.tokenId;
      return acc;
    },
    {},
  );

  const open = normalized.blockDelimiters.open;
  const close = normalized.blockDelimiters.close;
  const blockDelimiters =
    normalized.modes.block === "delimited" &&
    open &&
    close &&
    !validateBlockDelimiters({ open, close })
      ? {
          blockDelimiters: {
            open,
            close,
          },
        }
      : {};

  return {
    keywordMap,
    operatorWordMap: normalized.operatorWordMap,
    booleanLiteralMap: normalized.booleanLiteralMap,
    ...(normalized.statementTerminatorLexeme
      ? { statementTerminatorLexeme: normalized.statementTerminatorLexeme }
      : {}),
    grammar: {
      semicolonMode: normalized.modes.semicolon,
      blockMode: normalized.modes.block,
      typingMode: normalized.modes.typing,
      arrayMode: normalized.modes.array,
    },
    indentationBlock: normalized.modes.block === "indentation",
    ...blockDelimiters,
  };
}
