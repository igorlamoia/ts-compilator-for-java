export function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

export function isHexDigit(c: string): boolean {
  return isDigit(c) || (c >= "A" && c <= "F");
}

export function isOctalDigit(c: string): boolean {
  return c >= "0" && c <= "7";
}

export function isAlpha(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
}

export function isAlphaNumeric(c: string): boolean {
  return isAlpha(c) || isDigit(c);
}

export function isWhitespace(c: string): boolean {
  return c === " " || c === "\r" || c === "\t";
}
