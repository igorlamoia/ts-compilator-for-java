import { Token } from "./utils/token";
import {
  TOKENS,
  ArithmeticOperators,
  LogicalOperators,
  RelationalOperators,
  AssignmentOperators,
  ReservedWords,
  Symbols,
  Literals,
} from "./utils/tokens";

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private current = 0;
  private line = 1;
  private column = 1;
  private start = 0;

  private reservedWords: { [key: string]: number } = ReservedWords;

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

    const tokenFunction = this.tokenMap[c];
    if (tokenFunction) {
      tokenFunction(this);
    } else if (this.isWhitespace(c)) {
      // Ignora espaços em branco
    } else if (c === "\n") {
      this.line++;
      this.column = 0;
    } else if (c === '"') {
      this.string();
    } else if (this.isDigit(c)) {
      this.number();
    } else if (this.isAlpha(c)) {
      this.identifier();
    } else {
      this.error(`Caractere inesperado '${c}'`);
    }
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

  private match(expected: string): boolean {
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

  private addToken(type: number, lexeme?: string) {
    const text = lexeme || this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(type, text, this.line, this.column - text.length)
    );
  }

  private error(message: string) {
    console.error(
      `[Linha ${this.line}, Coluna ${this.column}] Erro: ${message}`
    );
  }

  private isWhitespace(c: string): boolean {
    return c === " " || c === "\r" || c === "\t";
  }

  private tokenMap: { [key: string]: (lexer: Lexer) => void } = {
    "+": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(AssignmentOperators.PLUS_EQUAL);
      } else {
        lexer.addToken(ArithmeticOperators.PLUS);
      }
    },
    "-": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(AssignmentOperators.MINUS_EQUAL);
      } else {
        lexer.addToken(ArithmeticOperators.MINUS);
      }
    },
    "*": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(AssignmentOperators.STAR_EQUAL);
      } else {
        lexer.addToken(ArithmeticOperators.STAR);
      }
    },
    "/": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(AssignmentOperators.SLASH_EQUAL);
      } else {
        lexer.addToken(ArithmeticOperators.SLASH);
      }
    },
    "%": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(AssignmentOperators.MODULO_EQUAL);
      } else {
        lexer.addToken(ArithmeticOperators.MODULO);
      }
    },
    ";": (lexer) => {
      lexer.addToken(Symbols.SEMICOLON);
    },
    ",": (lexer) => {
      lexer.addToken(Symbols.COMMA);
    },
    "{": (lexer) => {
      lexer.addToken(Symbols.LEFT_BRACE);
    },
    "}": (lexer) => {
      lexer.addToken(Symbols.RIGHT_BRACE);
    },
    "(": (lexer) => {
      lexer.addToken(Symbols.LEFT_PAREN);
    },
    ")": (lexer) => {
      lexer.addToken(Symbols.RIGHT_PAREN);
    },
    ".": (lexer) => {
      lexer.addToken(Symbols.DOT);
    },
    "!": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(RelationalOperators.NOT_EQUAL);
      } else {
        lexer.addToken(LogicalOperators.LOGICAL_NOT);
      }
    },
    "=": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(RelationalOperators.EQUAL_EQUAL);
      } else {
        lexer.addToken(AssignmentOperators.EQUAL);
      }
    },
    ">": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(RelationalOperators.GREATER_EQUAL);
      } else {
        lexer.addToken(RelationalOperators.GREATER);
      }
    },
    "<": (lexer) => {
      if (lexer.match("=")) {
        lexer.addToken(RelationalOperators.LESS_EQUAL);
      } else {
        lexer.addToken(RelationalOperators.LESS);
      }
    },
    "|": (lexer) => {
      if (lexer.match("|")) {
        lexer.addToken(LogicalOperators.LOGICAL_OR);
      } else {
        lexer.error("Caractere inesperado '|'");
      }
    },
    "&": (lexer) => {
      if (lexer.match("&")) {
        lexer.addToken(LogicalOperators.LOGICAL_AND);
      } else {
        lexer.error("Caractere inesperado '&'");
      }
    },
  };

  private string() {
    let value = "";
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
        this.column = 0;
      }
      if (this.peek() === "\\") {
        value += this.advance();
        value += this.advance();
      } else {
        value += this.advance();
      }
    }
    if (this.isAtEnd()) {
      this.error("String não terminada.");
      return;
    }
    this.advance(); // Fecha a string
    this.addToken(Literals.STRING_LITERAL, '"' + value + '"');
  }

  private number() {
    let numberStr = this.source.substring(this.start, this.current);
    if (numberStr === "0") {
      if (this.peek().toLowerCase() === "x") {
        numberStr += this.advance(); // Consome 'x'
        while (this.isHexDigit(this.peek())) {
          numberStr += this.advance();
        }
        this.addToken(Literals.HEX_LITERAL, numberStr);
      } else {
        while (this.isDigit(this.peek())) {
          numberStr += this.advance();
        }
        this.addToken(Literals.OCTAL_LITERAL, numberStr);
      }
    } else {
      while (this.isDigit(this.peek())) {
        numberStr += this.advance();
      }
      if (this.peek() === ".") {
        numberStr += this.advance();
        while (this.isDigit(this.peek())) {
          numberStr += this.advance();
        }
        if (numberStr.endsWith(".")) {
          numberStr += "0"; // Adiciona '0' se terminar com '.'
        }
        this.addToken(Literals.FLOAT_LITERAL, numberStr);
      } else {
        this.addToken(Literals.INTEGER_LITERAL, numberStr);
      }
    }
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const ident = this.source.substring(this.start, this.current);
    const type = this.reservedWords[ident];
    if (type !== undefined) {
      this.addToken(type, ident);
    } else {
      this.addToken(Literals.IDENTIFIER, ident);
    }
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
