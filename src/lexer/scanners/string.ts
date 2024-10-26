import { LITERALS } from "../../token/constants";
import { LexerScanner } from "./lexer-scanner";

export default class StringScanner extends LexerScanner {
  public run(): void {
    let value = "";
    while (this.lexer.peek() !== '"' && !this.lexer.isAtEnd()) {
      if (this.lexer.peek() === "\n") this.lexer.goToNextLine();
      if (this.lexer.peek() === "\\") {
        value += this.lexer.peekAndAdvance();
        if (!this.lexer.isAtEnd()) value += this.lexer.peekAndAdvance();
        continue;
      }
      value += this.lexer.peekAndAdvance();
    }

    if (this.lexer.isAtEnd()) {
      this.lexer.error("Not fineshed String.");
      return;
    }

    this.lexer.peekAndAdvance(); // Consume the closing quote
    this.lexer.addToken(LITERALS.string_literal, '"' + value + '"');
  }
}
