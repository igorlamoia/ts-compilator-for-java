import { LexerScanner } from "./lexer";
import { TOKENS } from "../../token/constants";

const { LITERALS } = TOKENS;
const escapeSequences: { [key: string]: string } = {
  n: "\n",
  t: "\t",
};

export default class StringScanner extends LexerScanner {
  public run(): void {
    let value = "",
      removedChars = 0;
    while (!['"', "\n"].includes(this.lexer.peek()) && !this.lexer.isAtEnd()) {
      const [actual, next] = [this.lexer.peek(), this.lexer.peekNext()];
      if (actual === "\\" && escapeSequences[next]) {
        this.lexer.advance(2);
        value += escapeSequences[next];
        removedChars++;
        continue;
      }
      if (!this.lexer.isAtEnd()) value += this.lexer.peekAndAdvance();
    }

    if (this.lexer.peek() === "\n")
      return this.lexer.error("lexer.unterminated_string_same_line");
    if (this.lexer.isAtEnd())
      return this.lexer.error("lexer.unterminated_string");

    this.lexer.peekAndAdvance(); // Consume the closing quote
    this.lexer.addToken(
      LITERALS.string_literal,
      '"' + value + '"',
      -removedChars
    );
  }
}
