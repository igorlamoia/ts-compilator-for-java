import { Token } from "../token";

export class Parser {
  tokens: Token[];
  current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  peek(): Token {
    return this.tokens[this.current];
  }

  previous(): Token {
    return this.tokens[this.current - 1];
  }

  advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  check(...types: number[]): boolean {
    if (this.isAtEnd()) return false;
    return types.includes(this.peek().type);
  }

  consume(type: number, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} at token ${this.peek().lexeme}`);
  }

  match(...types: number[]): boolean {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
}
