import { isDigit, isHexDigit, isWhitespace } from "../lexer-helpers";
import { LITERALS } from "../../token/constants";
import { TOKENS_MAP } from "../../token/mappings";
import { LexerScanner } from "./lexer-scanner";

export default class NumberScanner extends LexerScanner {
  public run(): void {
    let numberStr = this.lexer.source.substring(
      this.lexer.start,
      this.lexer.current
    );

    if (numberStr === "0") {
      const nextChar = this.lexer.peek().toLowerCase();
      if (nextChar === "x") {
        numberStr += this.lexer.peekAndAdvance(); // Consome 'x'
        while (isHexDigit(this.lexer.peek())) {
          numberStr += this.lexer.peekAndAdvance();
        }
        this.lexer.addToken(LITERALS.hex_literal, numberStr);
        return;
      }

      while (isDigit(this.lexer.peek())) {
        numberStr += this.lexer.peekAndAdvance();
      }
      this.lexer.addToken(LITERALS.octal_literal, numberStr);
      return;
    }

    while (isDigit(this.lexer.peek())) {
      numberStr += this.lexer.peekAndAdvance();
    }

    this.validateNumber(this.lexer.peek(), true);

    if (this.lexer.peek() !== ".")
      return this.lexer.addToken(LITERALS.integer_literal, numberStr);

    numberStr += this.lexer.peekAndAdvance();
    while (isDigit(this.lexer.peek())) {
      numberStr += this.lexer.peekAndAdvance();
    }

    this.validateNumber(this.lexer.peek(), true);

    if (numberStr.endsWith(".")) numberStr += "0";
    this.lexer.addToken(LITERALS.float_literal, numberStr);
  }

  private validateNumber(c: string, throws: boolean = false) {
    const isInvalidNumber =
      !isWhitespace(c) && c !== "." && !isDigit(c) && !TOKENS_MAP[c];
    if (isInvalidNumber && throws) this.lexer.error("Caractere inesperado");
    return !isInvalidNumber;
  }
}
