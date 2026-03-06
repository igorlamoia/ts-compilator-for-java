export type KeywordMap = Record<string, number>;

export type LexerBlockDelimiters = {
  open: string;
  close: string;
};

export type LexerConfig = {
  customKeywords?: KeywordMap;
  blockDelimiters?: LexerBlockDelimiters;
  locale?: string;
};

const WORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

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
