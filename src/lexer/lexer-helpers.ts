export function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

export function isHexDigit(c: string): boolean {
  return isDigit(c) || (c.toLowerCase() >= "a" && c.toLowerCase() <= "f");
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
