import { TOKENS_MAP } from "../token/mappings";
import { Token } from "../token";
import { TOKENS } from "../token/constants";
import { isAlpha, isDigit, isWhitespace } from "./lexer-helpers";
import { IdentifierScanner, NumberScanner, StringScanner } from "./scanners";

export class Lexer {
  public source: string;
  public tokens: Token[] = [];
  public current = 0;
  public line = 1;
  public column = 1;
  public start = 0;

  constructor(source: string) {
    this.source = source;
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TOKENS.EOF, "", this.line, this.column));
    return this.tokens;
  }

  public scanToken() {
    const c = this.peekAndAdvance();
    if (isWhitespace(c)) return;
    const tokenFunction = TOKENS_MAP[c];
    if (tokenFunction) return tokenFunction(this);
    if (c === "\n") return this.goToNextLine();
    if (c === '"') return new StringScanner(this).run();
    if (isDigit(c)) return new NumberScanner(this).run();
    if (isAlpha(c)) return new IdentifierScanner(this).run();

    this.error(`Caractere inesperado '${c}'`);
  }

  public isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  public peekAndAdvance(): string {
    const c = this.source[this.current];
    this.current++;
    this.column++;
    return c;
  }

  public match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;
    this.current++;
    this.column++;
    return true;
  }

  public addToken(type: number, lexeme?: string) {
    const text = lexeme || this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(type, text, this.line, this.column - text.length)
    );
  }

  public peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  public peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  public peekPrevious(): string {
    if (this.current - 1 < 0) return "\0";
    return this.source[this.current - 1];
  }

  public goToNextLine() {
    this.line++;
    this.column = 0;
  }

  public error(message: string) {
    throw new Error(
      `Row: ${this.line}, Column ${this.column}, Error message: ${message}`
    );
  }
}
