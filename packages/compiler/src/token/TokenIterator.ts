import { Instruction } from "../interpreter/constants";
import { functionCall } from "../grammar/syntax/function-call";
import { Emitter } from "../ir/emitter";
import { Token } from "./";

interface LoopContext {
  breakLabel: string;
  continueLabel: string;
}

export class TokenIterator {
  private tokens: Token[];
  private index: number;
  public readonly emitter: Emitter;
  private loopStack: LoopContext[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.index = 0;
    this.emitter = new Emitter();
    this.loopStack = [];
  }

  peek(): Token {
    return this.tokens[this.index];
  }

  next(): Token {
    if (!this.hasNext()) throw new Error("No more tokens available.");
    return this.tokens[this.index++];
  }

  consume(expectedType: number, expectedLexeme?: string): Token {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    if (isDifferentType || isDifferentLexeme)
      throw new Error(
        `Unexpected token at line ${token.line}, column ${token.column}. ` +
          `Expected type ${expectedType}, but got type ${token.type}, lexeme "${token.lexeme}".`
      );
    return this.next();
  }

  match(expectedType: number, expectedLexeme?: string): boolean {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    return !isDifferentType && !isDifferentLexeme;
  }

  hasNext(): boolean {
    return this.index < this.tokens.length;
  }

  generateIntermediateCode(): Instruction[] {
    const tree = functionCall(this);
    return this.emitter.getInstructions();
  }

  pushLoopContext(breakLabel: string, continueLabel: string): void {
    this.loopStack.push({ breakLabel, continueLabel });
  }

  popLoopContext(): void {
    this.loopStack.pop();
  }

  getCurrentBreakLabel(): string | null {
    if (this.loopStack.length === 0) return null;
    return this.loopStack[this.loopStack.length - 1].breakLabel;
  }

  getCurrentContinueLabel(): string | null {
    if (this.loopStack.length === 0) return null;
    return this.loopStack[this.loopStack.length - 1].continueLabel;
  }
}
