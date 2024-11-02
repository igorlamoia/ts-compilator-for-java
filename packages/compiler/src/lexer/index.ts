import { Token } from "../token";
import { TOKENS } from "../token/constants";
import { isWhitespace } from "./lexer-helpers";
import { LexerScannerFactory } from "./scanners";

export class Lexer {
  source: string;
  tokens: Token[] = [];
  line = 1;
  column = 1;
  scannerBegin = 0;
  current = 0;

  constructor(source: string) {
    this.source = source;
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.scannerBegin = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TOKENS.EOF, "", this.line, this.column));
    return this.tokens;
  }

  public scanToken() {
    const char = this.peekAndAdvance();
    if (isWhitespace(char)) return;
    if (char === "\n") return this.goToNextLine();

    const scanner = LexerScannerFactory.getInstance(char, this);
    if (scanner) return scanner.run();

    this.error(`Caractere inesperado '${char}'`);
  }

  public isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  public advance() {
    this.current++;
    this.column++;
  }

  public peekAndAdvance(): string {
    const char = this.source[this.current];
    this.advance();
    return char;
  }

  public matchAndAdvance(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;
    this.advance();
    return true;
  }

  public addToken(type: number, lexeme?: string) {
    const text =
      lexeme || this.source.substring(this.scannerBegin, this.current);
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
    this.column = 1;
  }

  public error(message: string) {
    throw new Error(
      `Row: ${this.line}, Column ${this.column}, Error message: ${message}`
    );
  }
}
