import { Token } from "../token";
import { TOKENS } from "../token/constants";
import { isWhitespace } from "./lexer-helpers";
import { LexerScannerFactory } from "./scanners";
import { IssueWarning, IssueInfo, IssueError } from "../issue";

export type KeywordMap = Record<string, number>;

export class Lexer {
  source: string;
  tokens: Token[] = [];
  line = 1;
  column = 1;
  scannerBegin = 0;
  current = 0;
  warnings: IssueWarning[] = [];
  infos: IssueInfo[] = [];
  keywordMap: KeywordMap;

  constructor(source: string, customKeywords?: KeywordMap) {
    this.source = source;
    this.keywordMap = customKeywords ?? (TOKENS.RESERVEDS as KeywordMap);
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.scannerBegin = this.current;
      this.scanToken();
    }

    // this.tokens.push(new Token(TOKENS.EOF, "", this.line, this.column));
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

  public advance(columns = 1): void {
    this.current += columns;
    this.column += columns;
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

  /**
   * Add a token to the list of tokens class
   * @param type Token type from TOKENS enum
   * @param lexeme Token lexeme string
   * @param addedChars Number of added chars to the lexeme string (default 0), used to calculate the column position of the beginning of the token
   */
  public addToken(type: number, lexeme?: string, addedChars: number = 0) {
    const text =
      lexeme || this.source.substring(this.scannerBegin, this.current);
    this.tokens.push(
      new Token(type, text, this.line, this.column - text.length + addedChars)
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
    throw new IssueError(message, this.line, this.column);
  }

  public warning(message: string) {
    this.warnings.push(new IssueWarning(message, this.line, this.column));
  }

  public info(message: string) {
    this.infos.push(new IssueInfo(message, this.line, this.column));
  }
}
