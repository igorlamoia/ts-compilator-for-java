import type {
  IDECompilerConfigPayload,
  IDEGrammarConfig,
  IDEPartialCompilerConfigPayload,
} from "../entities/compiler-config";

const DEFAULT_GRAMMAR: IDEGrammarConfig = {
  semicolonMode: "optional-eol",
  blockMode: "delimited",
};

export function normalizeCompilerConfig(
  input: IDEPartialCompilerConfigPayload,
): IDECompilerConfigPayload {
  const grammar: IDEGrammarConfig = {
    semicolonMode:
      input.grammar?.semicolonMode ?? DEFAULT_GRAMMAR.semicolonMode,
    blockMode: input.grammar?.blockMode ?? DEFAULT_GRAMMAR.blockMode,
  };

  const indentationBlock = grammar.blockMode === "indentation";
  const hasDelimiters =
    typeof input.blockDelimiters?.open === "string" &&
    typeof input.blockDelimiters?.close === "string" &&
    input.blockDelimiters.open.trim().length > 0 &&
    input.blockDelimiters.close.trim().length > 0;

  return {
    keywordMap: input.keywordMap ?? {},
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
