import type {
  BooleanLiteralMap,
  KeywordMap,
  OperatorWordMap,
} from "@ts-compilator-for-java/compiler/src/lexer/config";
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";
import type {
  IDEBooleanLiteralMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";

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

export const DEFAULT_BOOLEAN_LITERAL_MAP: IDEBooleanLiteralMap = {
  true: "true",
  false: "false",
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

  const validKeys = new Set<string>([
    "logical_or",
    "logical_and",
    "logical_not",
    "less",
    "less_equal",
    "greater",
    "greater_equal",
    "equal_equal",
    "not_equal",
  ]);

  const next: OperatorWordMap = { ...DEFAULT_OPERATOR_WORD_MAP };

  for (const [key, alias] of Object.entries(value)) {
    // Only process valid OperatorWordMap keys
    if (!validKeys.has(key)) continue;
    if (typeof alias !== "string") continue;
    const normalizedAlias = alias.trim();
    if (normalizedAlias.length === 0) continue;
    next[key as keyof OperatorWordMap] = normalizedAlias;
  }

  // Validate that all values are unique to prevent duplicate aliases
  const seenValues = new Set<string>();
  for (const alias of Object.values(next)) {
    if (typeof alias === "string") {
      if (seenValues.has(alias)) {
        // If duplicates detected, reset to defaults to prevent lexer errors
        return { ...DEFAULT_OPERATOR_WORD_MAP };
      }
      seenValues.add(alias);
    }
  }

  return next;
}

export function sanitizeBooleanLiteralMap(value: unknown): BooleanLiteralMap {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_BOOLEAN_LITERAL_MAP };
  }

  const next: IDEBooleanLiteralMap = { ...DEFAULT_BOOLEAN_LITERAL_MAP };

  for (const [key, alias] of Object.entries(value)) {
    if (key !== "true" && key !== "false") continue;
    if (typeof alias !== "string") continue;

    const normalizedAlias = alias.trim();
    if (normalizedAlias.length === 0) continue;

    next[key as keyof IDEBooleanLiteralMap] = normalizedAlias;
  }

  if (next.true === next.false) {
    return { ...DEFAULT_BOOLEAN_LITERAL_MAP };
  }

  return next;
}
