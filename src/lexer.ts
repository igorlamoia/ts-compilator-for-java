import { TOKENS_MAP } from "./utils/tokens-map";
import { Token } from "./utils/token";
import { TOKENS, RESERVEDS, Literals } from "./utils/tokens";

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private current = 0;
  private line = 1;
  private column = 1;
  private start = 0;

  private RESERVEDS: { [key: string]: number } = RESERVEDS;

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

  private scanToken() {
    const c = this.advance();

    const tokenFunction = TOKENS_MAP[c];
    if (tokenFunction) return tokenFunction(this);
    if (this.isWhitespace(c)) return;
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

  private advance(): string {
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

  public addToken(type: number, lexeme?: string) {
    const text = lexeme || this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(type, text, this.line, this.column - text.length)
    );
  }

  public error(message: string) {
    console.error(
      `[Linha ${this.line}, Coluna ${this.column}] Erro: ${message}`
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
        value += this.advance();
        if (!this.isAtEnd()) value += this.advance();
        continue;
      }
      value += this.advance();
    }

    if (this.isAtEnd()) {
      this.error("String não terminada.");
      return;
    }

    this.advance(); // Consome o caractere de fechamento "
    this.addToken(Literals.STRING_LITERAL, '"' + value + '"');
  }

  private number() {
    let numberStr = this.source.substring(this.start, this.current);

    if (numberStr === "0") {
      const nextChar = this.peek().toLowerCase();
      if (nextChar === "x") {
        numberStr += this.advance(); // Consome 'x'
        while (this.isHexDigit(this.peek())) {
          numberStr += this.advance();
        }
        this.addToken(Literals.HEX_LITERAL, numberStr);
        return;
      }

      while (this.isDigit(this.peek())) {
        numberStr += this.advance();
      }
      this.addToken(Literals.OCTAL_LITERAL, numberStr);
      return;
    }

    while (this.isDigit(this.peek())) {
      numberStr += this.advance();
    }

    if (this.peek() === ".") {
      numberStr += this.advance();
      while (this.isDigit(this.peek())) {
        numberStr += this.advance();
      }
      if (numberStr.endsWith(".")) numberStr += "0";
      this.addToken(Literals.FLOAT_LITERAL, numberStr);
      return;
    }
    this.addToken(Literals.INTEGER_LITERAL, numberStr);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const ident = this.source.substring(this.start, this.current);
    const type = this.RESERVEDS[ident];
    this.addToken(type !== undefined ? type : Literals.IDENTIFIER, ident);
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
