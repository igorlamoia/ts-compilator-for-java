import { TOKENS_MAP } from "../tokens/mappings";
import { Token } from "../tokens";
import { TOKENS } from "../tokens/constants";

const { LITERALS, RESERVEDS } = TOKENS;

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private current = 0;
  private line = 1;
  private column = 1;
  private start = 0;

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

  private getLastToken(): Token {
    return this.tokens[this.tokens.length - 1];
  }

  private scanToken() {
    const c = this.peekAndAdvance();
    if (this.isWhitespace(c)) return;
    const tokenFunction = TOKENS_MAP[c];
    if (tokenFunction) return tokenFunction(this);
    if (c === "\n") {
      this.line++;
      this.column = 0;
      return;
    }
    if (c === '"') return this.string();
    if (this.isDigit(c)) return this.number();
    if (this.isAlpha(c)) return this.identifier();

    this.error(`Caractere inesperado '${c}'`);
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private peekAndAdvance(): string {
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

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  private peekPrevious(): string {
    if (this.current - 1 < 0) return "\0";
    return this.source[this.current - 1];
  }

  public addToken(type: number, lexeme?: string) {
    const text = lexeme || this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(type, text, this.line, this.column - text.length)
    );
  }

  public error(message: string) {
    throw new Error(
      `Row: ${this.line}, Column ${this.column}, Error message: ${message}`
    );
  }

  private isWhitespace(c: string): boolean {
    return c === " " || c === "\r" || c === "\t";
  }

  private string() {
    let value = "";
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
        this.column = 0;
      }
      if (this.peek() === "\\") {
        value += this.peekAndAdvance();
        if (!this.isAtEnd()) value += this.peekAndAdvance();
        continue;
      }
      value += this.peekAndAdvance();
    }

    if (this.isAtEnd()) {
      this.error("Not fineshed String.");
      return;
    }

    this.peekAndAdvance(); // Consome o caractere de fechamento "
    this.addToken(LITERALS.string_literal, '"' + value + '"');
  }

  private validateNumber(c: string, throws: boolean = false) {
    const isInvalidNumber =
      !this.isWhitespace(c) && c !== "." && !this.isDigit(c) && !TOKENS_MAP[c];
    if (isInvalidNumber && throws) this.error("Caractere inesperado");
    return !isInvalidNumber;
  }

  private number() {
    let numberStr = this.source.substring(this.start, this.current);

    if (numberStr === "0") {
      const nextChar = this.peek().toLowerCase();
      if (nextChar === "x") {
        numberStr += this.peekAndAdvance(); // Consome 'x'
        while (this.isHexDigit(this.peek())) {
          numberStr += this.peekAndAdvance();
        }
        this.addToken(LITERALS.hex_literal, numberStr);
        return;
      }

      while (this.isDigit(this.peek())) {
        numberStr += this.peekAndAdvance();
      }
      this.addToken(LITERALS.octal_literal, numberStr);
      return;
    }

    while (this.isDigit(this.peek())) {
      numberStr += this.peekAndAdvance();
    }

    this.validateNumber(this.peek(), true);

    if (this.peek() !== ".")
      return this.addToken(LITERALS.integer_literal, numberStr);

    numberStr += this.peekAndAdvance();
    while (this.isDigit(this.peek())) {
      numberStr += this.peekAndAdvance();
    }

    this.validateNumber(this.peek(), true);

    if (numberStr.endsWith(".")) numberStr += "0";
    this.addToken(LITERALS.float_literal, numberStr);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.peekAndAdvance();
    const ident = this.source.substring(
      this.start,
      this.current
    ) as keyof typeof RESERVEDS;
    const type = RESERVEDS[ident];
    this.addToken(type ?? LITERALS.identifier, ident as string);
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private isHexDigit(c: string): boolean {
    return (
      this.isDigit(c) || (c.toLowerCase() >= "a" && c.toLowerCase() <= "f")
    );
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
