import {
  isDigit,
  isHexDigit,
  isOctalDigit,
  isWhitespace,
} from "../lexer-helpers";
import { LITERALS } from "../../token/constants";
import { TOKENS_MAP } from "../../token/mappings";
import { LexerScanner } from "./lexer";

export default class NumberScanner extends LexerScanner {
  public run(): void {
    let numberStr = this.lexer.peekPrevious();

    if (numberStr === "0") {
      if (this.lexer.peek().toLocaleLowerCase() === "x") return this.scanHex();
      return this.scanOctal();
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

  private scanHex(): void {
    if (this.lexer.peek() === "X")
      return this.lexer.error("Número hexadecimal inválido");
    let numberStr = "0x";
    while (isHexDigit(this.lexer.peek())) {
      numberStr += this.lexer.peekAndAdvance();
    }

    this.lexer.addToken(LITERALS.hex_literal, numberStr);
  }

  private scanOctal(): void {
    let numberStr = "0";
    while (isOctalDigit(this.lexer.peek())) {
      numberStr += this.lexer.peekAndAdvance();
    }

    this.lexer.addToken(LITERALS.octal_literal, numberStr);
  }
}
