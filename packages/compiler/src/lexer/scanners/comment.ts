import { ASSIGNMENTS } from "token/constants";
import { LexerScanner } from "./lexer";

export default class CommentScanner extends LexerScanner {
  run(): void {
    if (this.lexer.peek() === "/") return this.lineComment();
    this.multiLineComment();
  }

  private lineComment(): void {
    this.lexer.advance();
    while (!this.lexer.isAtEnd() && this.lexer.peekAndAdvance() !== "\n");
    if (!this.lexer.isAtEnd()) this.lexer.goToNextLine();
  }

  private multiLineComment(): void {
    this.lexer.advance();
    let currentChar = this.lexer.peekAndAdvance();
    while (
      !this.lexer.isAtEnd() &&
      !(currentChar === "*" && this.lexer.peek() === "/")
    ) {
      currentChar = this.lexer.peekAndAdvance();
      if (currentChar === "\n") this.lexer.goToNextLine();
    }

    if (this.lexer.isAtEnd()) this.lexer.error("Comentário não fechado");
    this.lexer.advance();
  }
}
