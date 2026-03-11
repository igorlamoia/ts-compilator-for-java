export type KeywordMap = Record<string, number>;

export type OperatorWordMap = {
  logical_or?: string;
  logical_and?: string;
  logical_not?: string;
  less?: string;
  less_equal?: string;
  greater?: string;
  greater_equal?: string;
  equal_equal?: string;
  not_equal?: string;
};

export type LexerBlockDelimiters = {
  open: string;
  close: string;
};

export type LexerConfig = {
  customKeywords?: KeywordMap;
  operatorWordMap?: OperatorWordMap;
  blockDelimiters?: LexerBlockDelimiters;
  locale?: string;
  indentationBlock?: boolean;
  tabWidth?: number;
};

const WORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

const OPERATOR_WORD_TOKEN_IDS = {
  logical_or: 6,
  logical_and: 7,
  logical_not: 8,
  equal_equal: 9,
  not_equal: 10,
  greater: 11,
  greater_equal: 12,
  less: 13,
  less_equal: 14,
} as const;

export function buildOperatorWordTokenMap(
  operatorWordMap: OperatorWordMap | undefined,
): KeywordMap {
  if (!operatorWordMap) return {};

  return Object.entries(operatorWordMap).reduce((acc, [slot, alias]) => {
    if (typeof alias !== "string") {
      return acc;
    }

    const normalizedAlias = alias.trim();
    if (normalizedAlias.length === 0) {
      return acc;
    }

    acc[normalizedAlias] =
      OPERATOR_WORD_TOKEN_IDS[slot as keyof typeof OPERATOR_WORD_TOKEN_IDS];
    return acc;
  }, {} as KeywordMap);
}

export function validateBlockDelimiters(
  delimiters: LexerBlockDelimiters,
  reserved: KeywordMap,
): void {
  const { open, close } = delimiters;

  if (!WORD_REGEX.test(open) || !WORD_REGEX.test(close)) {
    throw new Error("block delimiters must be identifier-like words");
  }

  if (open === close) {
    throw new Error("block delimiters must be different");
  }

  if (reserved[open] !== undefined || reserved[close] !== undefined) {
    throw new Error("block delimiters cannot reuse reserved keywords");
  }
}

export function validateOperatorWordMap(
  operatorWordMap: OperatorWordMap,
  reserved: KeywordMap,
  customKeywords: KeywordMap = {},
  blockDelimiters?: LexerBlockDelimiters,
): void {
  const seenAliases = new Set<string>();

  for (const alias of Object.values(operatorWordMap)) {
    if (typeof alias !== "string") {
      continue;
    }

    const normalizedAlias = alias.trim();
    if (normalizedAlias.length === 0) {
      continue;
    }

    if (!WORD_REGEX.test(normalizedAlias)) {
      throw new Error("operator aliases must be identifier-like words");
    }

    if (seenAliases.has(normalizedAlias)) {
      throw new Error("operator aliases cannot be duplicated");
    }
    seenAliases.add(normalizedAlias);

    if (reserved[normalizedAlias] !== undefined) {
      throw new Error("operator aliases cannot reuse reserved keywords");
    }

    if (customKeywords[normalizedAlias] !== undefined) {
      throw new Error("operator aliases cannot conflict with keyword overrides");
    }

    if (
      blockDelimiters &&
      (normalizedAlias === blockDelimiters.open ||
        normalizedAlias === blockDelimiters.close)
    ) {
      throw new Error("operator aliases cannot conflict with block delimiters");
    }
  }
}
