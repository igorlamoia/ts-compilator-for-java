import { Lexer } from "lexer";

export abstract class LexerScanner {
  constructor(protected lexer: Lexer) {}
  abstract run(): void;
}
