import { LITERALS } from "../../token/constants";
import { LexerScanner } from "./lexer";

export default class StringScanner extends LexerScanner {
  public run(): void {
    let value = "";
    while (!['"', "\n"].includes(this.lexer.peek()) && !this.lexer.isAtEnd()) {
      if (this.lexer.peek() === "\\") {
        value += this.lexer.peekAndAdvance();
        if (!this.lexer.isAtEnd()) value += this.lexer.peekAndAdvance();
        continue;
      }
      value += this.lexer.peekAndAdvance();
    }

    if (this.lexer.peek() === "\n")
      return this.lexer.error("Unterminated String.");
    if (this.lexer.isAtEnd()) return this.lexer.error("Unterminated String.");

    this.lexer.peekAndAdvance(); // Consume the closing quote
    this.lexer.addToken(LITERALS.string_literal, '"' + value + '"');
  }
}
