import { LexerScanner } from "./lexer";
import { isDigit, isHexDigit, isOctalDigit } from "../lexer-helpers";
import { TOKENS } from "../../token/constants";

const { LITERALS } = TOKENS;
export default class NumberScanner extends LexerScanner {
  public run(): void {
    let numberStr = this.lexer.peekPrevious();
    if (numberStr === ".") {
      numberStr = "0.";
      const addedChars = 1;
      this.lexer.warning(
        "Poorly written float number, 0 added at the beginning"
      );
      return this.scanFloat(numberStr, addedChars);
    }

    if (numberStr === "0" && this.lexer.peek() !== ".") {
      if (this.lexer.peek().toLocaleLowerCase() === "x") return this.scanHex();
      return this.scanOctal();
    }

    while (isDigit(this.lexer.peek())) numberStr += this.lexer.peekAndAdvance();
    if (this.lexer.peek() === ".") return this.scanFloat(numberStr);

    this.isValidSintaxe(this.lexer.peek(), true);
    return this.lexer.addToken(LITERALS.integer_literal, numberStr);
  }

  private scanFloat(numberStr: string, addedChars: number = 0): void {
    numberStr += this.lexer.peekAndAdvance();
    while (isDigit(this.lexer.peek())) numberStr += this.lexer.peekAndAdvance();
    this.isValidSintaxe(this.lexer.peek(), true, "Invalid float number");
    if (numberStr.endsWith(".")) {
      numberStr += "0";
      addedChars = 1;
      this.lexer.warning("Poorly written float number, 0 added at the end");
    }
    this.lexer.addToken(LITERALS.float_literal, numberStr, addedChars);
  }

  private scanHex(): void {
    if (this.lexer.peekAndAdvance() === "X")
      return this.lexer.error("The X in hex numbers must be lowercase");
    let numberStr = "0x";
    while (isHexDigit(this.lexer.peek()))
      numberStr += this.lexer.peekAndAdvance();
    this.isValidSintaxe(this.lexer.peek(), true, "Invalid hex number");
    this.lexer.addToken(LITERALS.hex_literal, numberStr);
  }

  private scanOctal(): void {
    let numberStr = "0";
    while (isOctalDigit(this.lexer.peek()))
      numberStr += this.lexer.peekAndAdvance();
    this.isValidSintaxe(this.lexer.peek(), true, "Invalid octal number");
    this.lexer.addToken(LITERALS.octal_literal, numberStr);
  }

  private isValidSintaxe(
    c: string,
    throws: boolean = false,
    message: string = "Invalid number"
  ): boolean {
    const isAllowed = ALLOWED_BEFORE_AFTER.includes(c);
    if (!isAllowed && throws) this.lexer.error(message);
    return isAllowed;
  }
}

const ALLOWED_BEFORE_AFTER = [
  ";",
  ",",
  "(",
  ")",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  ">",
  "<",
  "!",
  "|",
  "&",
  " ",
  "\n",
  "\t",
  "\r",
];
