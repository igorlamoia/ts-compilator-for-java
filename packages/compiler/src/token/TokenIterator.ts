import { Instruction } from "../interpreter/constants";
import { functionCall } from "../grammar/syntax/function-call";
import { IssueError } from "../issue";
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

  peekAt(offset: number): Token | undefined {
    return this.tokens[this.index + offset];
  }

  next(): Token {
    if (!this.hasNext()) {
      const last = this.tokens[this.tokens.length - 1];
      throw new IssueError(
        "iterator.no_more_tokens",
        last?.line ?? 1,
        last?.column ?? 1,
      );
    }
    return this.tokens[this.index++];
  }

  consume(expectedType: number, expectedLexeme?: string): Token {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    if (isDifferentType || isDifferentLexeme)
      throw new IssueError(
        "iterator.unexpected_token",
        token.line,
        token.column,
        {
          line: token.line,
          column: token.column,
          expectedType,
          actualType: token.type,
          lexeme: token.lexeme,
        }
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
    // Processar múltiplas funções
    while (this.hasNext()) {
      functionCall(this);
    }
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
