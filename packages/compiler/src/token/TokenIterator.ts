import { Instruction } from "../interpreter/constants";
import { functionCall } from "../grammar/syntax/function-call";
import { IssueError } from "../issue";
import { Emitter } from "../ir/emitter";
import { Token } from "./";
import { translate } from "../i18n";

interface LoopContext {
  breakLabel: string;
  continueLabel: string;
}

interface SwitchContext {
  breakLabel: string;
}

export type GrammarConfig = {
  semicolonMode?: "optional-eol" | "required";
  blockMode?: "delimited" | "indentation";
  typingMode?: "typed" | "untyped";
};

type TokenIteratorConfig = {
  locale?: string;
  grammar?: GrammarConfig;
};

export class TokenIterator {
  private tokens: Token[];
  private index: number;
  public readonly emitter: Emitter;
  private loopStack: LoopContext[];
  private switchStack: SwitchContext[];
  private breakStack: string[];
  private locale: string | undefined;
  private grammar: GrammarConfig | undefined;

  constructor(tokens: Token[], localeOrConfig?: string | TokenIteratorConfig) {
    const config: TokenIteratorConfig =
      typeof localeOrConfig === "string"
        ? { locale: localeOrConfig }
        : (localeOrConfig ?? {});

    this.tokens = tokens;
    this.index = 0;
    this.emitter = new Emitter();
    this.loopStack = [];
    this.switchStack = [];
    this.breakStack = [];
    this.locale = config.locale;
    this.grammar = config.grammar;
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
      const code = "iterator.no_more_tokens";
      const message = translate(this.locale, code);
      throw new IssueError(code, message, last?.line ?? 1, last?.column ?? 1);
    }
    return this.tokens[this.index++];
  }

  consume(expectedType: number, expectedLexeme?: string): Token {
    const token = this.peek();
    const isDifferentType = token.type !== expectedType;
    const isDifferentLexeme = expectedLexeme && token.lexeme !== expectedLexeme;
    if (isDifferentType || isDifferentLexeme) {
      const code = "iterator.unexpected_token";
      const params = {
        line: token.line,
        column: token.column,
        expectedType,
        actualType: token.type,
        lexeme: token.lexeme,
      };
      const message = translate(this.locale, code, params);
      throw new IssueError(code, message, token.line, token.column, params);
    }
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
    this.breakStack.push(breakLabel);
  }

  popLoopContext(): void {
    this.loopStack.pop();
    this.breakStack.pop();
  }

  pushSwitchContext(breakLabel: string): void {
    this.switchStack.push({ breakLabel });
    this.breakStack.push(breakLabel);
  }

  popSwitchContext(): void {
    this.switchStack.pop();
    this.breakStack.pop();
  }

  getCurrentBreakLabel(): string | null {
    return this.breakStack[this.breakStack.length - 1] ?? null;
  }

  getCurrentContinueLabel(): string | null {
    if (this.loopStack.length === 0) return null;
    return this.loopStack[this.loopStack.length - 1].continueLabel;
  }

  throwError(
    code: string,
    line: number,
    column: number,
    params?: Record<string, string | number | boolean>,
  ): never {
    const message = translate(this.locale, code, params);
    throw new IssueError(code, message, line, column, params);
  }

  getSemicolonMode(): "optional-eol" | "required" {
    return this.grammar?.semicolonMode ?? "optional-eol";
  }

  getBlockMode(): "delimited" | "indentation" {
    return this.grammar?.blockMode ?? "delimited";
  }

  getTypingMode(): "typed" | "untyped" {
    return this.grammar?.typingMode ?? "typed";
  }
}
