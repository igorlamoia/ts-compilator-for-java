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
