import { Lexer } from "..";

export abstract class LexerScanner {
  constructor(protected lexer: Lexer) {}
  abstract run(): void;
}
