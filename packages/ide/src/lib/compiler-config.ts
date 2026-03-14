import type {
  IDECompilerConfigPayload,
  IDEGrammarConfig,
  IDEOperatorWordMap,
  IDEPartialCompilerConfigPayload,
} from "../entities/compiler-config";

const DEFAULT_GRAMMAR: IDEGrammarConfig = {
  semicolonMode: "optional-eol",
  blockMode: "delimited",
  typingMode: "typed",
};

function normalizeOperatorWordMap(
  input: IDEOperatorWordMap | undefined,
): IDEOperatorWordMap {
  if (!input) return {};

  return Object.entries(input).reduce((acc, [key, value]) => {
    if (typeof value !== "string") {
      return acc;
    }

    const normalizedValue = value.trim();
    if (normalizedValue.length === 0) {
      return acc;
    }

    acc[key as keyof IDEOperatorWordMap] = normalizedValue;
    return acc;
  }, {} as IDEOperatorWordMap);
}

export function normalizeCompilerConfig(
  input: IDEPartialCompilerConfigPayload,
): IDECompilerConfigPayload {
  const grammar: IDEGrammarConfig = {
    semicolonMode:
      input.grammar?.semicolonMode ?? DEFAULT_GRAMMAR.semicolonMode,
    blockMode: input.grammar?.blockMode ?? DEFAULT_GRAMMAR.blockMode,
    typingMode: input.grammar?.typingMode ?? DEFAULT_GRAMMAR.typingMode,
  };

  const indentationBlock = grammar.blockMode === "indentation";
  const hasDelimiters =
    typeof input.blockDelimiters?.open === "string" &&
    typeof input.blockDelimiters?.close === "string" &&
    input.blockDelimiters.open.trim().length > 0 &&
    input.blockDelimiters.close.trim().length > 0;

  return {
    keywordMap: input.keywordMap ?? {},
    operatorWordMap: normalizeOperatorWordMap(input.operatorWordMap),
    grammar,
    indentationBlock,
    ...(grammar.blockMode === "delimited" && hasDelimiters
      ? {
          blockDelimiters: {
            open: input.blockDelimiters!.open.trim(),
            close: input.blockDelimiters!.close.trim(),
          },
        }
      : {}),
  };
}
