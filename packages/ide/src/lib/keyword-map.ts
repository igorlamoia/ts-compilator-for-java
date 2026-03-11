import type {
  KeywordMap,
  OperatorWordMap,
} from "@ts-compilator-for-java/compiler/src/lexer/config";
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";
import type { IDEOperatorWordMap } from "@/entities/compiler-config";

export const DEFAULT_OPERATOR_WORD_MAP: IDEOperatorWordMap = {
  logical_or: "or",
  logical_and: "and",
  logical_not: "not",
  less: "less",
  less_equal: "less_equal",
  greater: "greater",
  greater_equal: "greater_equal",
  equal_equal: "equal",
  not_equal: "not_equal",
};

function isValidKeywordEntry(value: unknown): value is [string, number] {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [key, tokenId] = value;
  return (
    typeof key === "string" &&
    key.trim().length > 0 &&
    typeof tokenId === "number"
  );
}

export function buildEffectiveKeywordMap(overrides?: unknown): KeywordMap {
  const sanitizedOverrides: KeywordMap = {};

  if (overrides && typeof overrides === "object") {
    for (const entry of Object.entries(overrides)) {
      if (!isValidKeywordEntry(entry)) continue;
      const [key, tokenId] = entry;
      sanitizedOverrides[key] = tokenId;
    }
  }

  return {
    ...(TOKENS.RESERVEDS as KeywordMap),
    ...sanitizedOverrides,
  };
}

export function sanitizeOperatorWordMap(value: unknown): OperatorWordMap {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_OPERATOR_WORD_MAP };
  }

  const next: OperatorWordMap = { ...DEFAULT_OPERATOR_WORD_MAP };

  for (const [key, alias] of Object.entries(value)) {
    if (typeof alias !== "string") continue;
    const normalizedAlias = alias.trim();
    if (normalizedAlias.length === 0) continue;
    next[key as keyof OperatorWordMap] = normalizedAlias;
  }

  return next;
}
