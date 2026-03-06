import { KeywordMap } from "@ts-compilator-for-java/compiler/src/lexer/config";
import { TOKENS } from "@ts-compilator-for-java/compiler/src/token/constants";

function isValidKeywordEntry(
  value: unknown,
): value is [string, number] {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [key, tokenId] = value;
  return typeof key === "string" && key.trim().length > 0 && typeof tokenId === "number";
}

export function buildEffectiveKeywordMap(
  overrides?: unknown,
): KeywordMap {
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
