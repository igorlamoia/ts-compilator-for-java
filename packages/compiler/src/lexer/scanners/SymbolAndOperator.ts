import { TOKENS_MAP } from "../../token/mappings";
import { LexerScanner } from "./lexer";

export default class SymbolAndOperatorScanner extends LexerScanner {
  run(): void {
    const char = this.lexer.peekPrevious();
    const tokenFunction = TOKENS_MAP[char];
    if (tokenFunction) tokenFunction(this.lexer);
  }
}
