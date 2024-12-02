import { Token } from "./";

export class TokenIterator {
  private tokens: Token[];
  private index: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek(): Token {
    return this.tokens[this.index];
  }

  next(): Token {
    if (!this.hasNext()) throw new Error("No more tokens available.");
    return this.tokens[this.index++];
  }

  consume(expectedType: number, expectedLexeme?: string): Token {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    if (isDifferentType || isDifferentLexeme)
      throw new Error(
        `Unexpected token at line ${token.line}, column ${token.column}. ` +
          `Expected type ${expectedType}, but got type ${token.type}, lexeme "${token.lexeme}".`
      );
    return this.next();
  }

  match(expectedType: number, expectedLexeme?: string): boolean {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    return !isDifferentType && !isDifferentLexeme;
  }

  hasNext(): boolean {
    return this.index < this.tokens.length;
  }
}
