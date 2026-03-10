import { Instruction } from "../interpreter/constants";
import { functionCall } from "../grammar/syntax/function-call";
import { IssueError, IssueInfo, IssueWarning } from "../issue";
import { Emitter } from "../ir/emitter";
import { Token } from "./";
import { TOKENS } from "./constants";
import { translate } from "../i18n";

interface LoopContext {
  breakLabel: string;
  continueLabel: string;
}

interface SwitchContext {
  breakLabel: string;
}

export type ValueType =
  | "int"
  | "float"
  | "string"
  | "bool"
  | "void"
  | "dynamic"
  | "unknown";

type FunctionSignature = {
  returnType: ValueType;
  params: ValueType[];
};

type Scope = Map<string, ValueType>;

export type ExprResult = {
  place: string;
  type: ValueType;
  token: Token;
};

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
  private warnings: IssueWarning[];
  private infos: IssueInfo[];
  private scopes: Scope[];
  private functions: Map<string, FunctionSignature>;
  private currentFunctionReturnType: ValueType | null;

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
    this.warnings = [];
    this.infos = [];
    this.scopes = [new Map<string, ValueType>()];
    this.functions = new Map<string, FunctionSignature>();
    this.currentFunctionReturnType = null;
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
      const expectedKey = TOKENS.BY_ID[expectedType];
      const actualKey = TOKENS.BY_ID[token.type];
      const params = {
        line: token.line,
        column: token.column,
        expectedType: expectedKey
          ? translate(this.locale, `token.${expectedKey}`)
          : String(expectedType),
        actualType: actualKey
          ? translate(this.locale, `token.${actualKey}`)
          : String(token.type),
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

  addWarning(
    code: string,
    line: number,
    column: number,
    params?: Record<string, string | number | boolean>,
  ): void {
    const message = translate(this.locale, code, params);
    this.warnings.push(new IssueWarning(code, message, line, column, params));
  }

  addInfo(
    code: string,
    line: number,
    column: number,
    params?: Record<string, string | number | boolean>,
  ): void {
    const message = translate(this.locale, code, params);
    this.infos.push(new IssueInfo(code, message, line, column, params));
  }

  getWarnings(): IssueWarning[] {
    return [...this.warnings];
  }

  getInfos(): IssueInfo[] {
    return [...this.infos];
  }

  enterScope(): void {
    this.scopes.push(new Map<string, ValueType>());
  }

  exitScope(): void {
    if (this.scopes.length > 1) {
      this.scopes.pop();
    }
  }

  declareSymbol(name: string, type: ValueType): void {
    this.scopes[this.scopes.length - 1]?.set(name, type);
  }

  resolveSymbol(name: string): ValueType {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const resolved = this.scopes[i]?.get(name);
      if (resolved) return resolved;
    }
    return "unknown";
  }

  declareFunction(
    name: string,
    returnType: ValueType,
    params: ValueType[],
  ): void {
    this.functions.set(name, { returnType, params });
  }

  resolveFunction(name: string): FunctionSignature | null {
    return this.functions.get(name) ?? null;
  }

  setCurrentFunctionReturnType(type: ValueType | null): void {
    this.currentFunctionReturnType = type;
  }

  getCurrentFunctionReturnType(): ValueType | null {
    return this.currentFunctionReturnType;
  }

  warnIfLossyIntConversion(
    targetType: ValueType,
    sourceType: ValueType,
    token: Token,
  ): void {
    if (targetType !== "int") return;
    if (sourceType !== "float") return;

    this.addWarning("grammar.lossy_int_conversion", token.line, token.column, {
      sourceType,
      targetType,
    });
  }

  inferLiteralType(token: Token): ValueType {
    if (
      token.type === TOKENS.LITERALS.integer_literal ||
      token.type === TOKENS.LITERALS.hex_literal ||
      token.type === TOKENS.LITERALS.octal_literal
    ) {
      return "int";
    }
    if (token.type === TOKENS.LITERALS.float_literal) {
      return "float";
    }
    if (token.type === TOKENS.LITERALS.string_literal) {
      return "string";
    }
    if (token.lexeme === "true" || token.lexeme === "false") {
      return "bool";
    }
    return "unknown";
  }

  createExprResult(place: string, type: ValueType, token: Token): ExprResult {
    return { place, type, token };
  }

  registerTemp(name: string, type: ValueType): void {
    this.declareSymbol(name, type);
  }

  mergeArithmeticTypes(left: ValueType, right: ValueType): ValueType {
    if (left === "float" || right === "float") return "float";
    if (left === "int" && right === "int") return "int";
    return "unknown";
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
