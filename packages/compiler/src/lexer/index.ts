import { Token } from "../token";
import { TOKENS } from "../token/constants";
import { isIndentationWhitespace, isWhitespace } from "./lexer-helpers";
import { LexerScannerFactory } from "./scanners";
import { IssueWarning, IssueInfo, IssueError } from "../issue";
import { TIssueParams } from "../issue/details";
import { translate } from "../i18n";
import {
  buildBooleanLiteralTokenMap,
  buildOperatorWordTokenMap,
  LexerConfig,
  normalizeStatementTerminatorLexeme,
  validateBlockDelimiters,
  validateBooleanLiteralMap,
  validateOperatorWordMap,
  validateStatementTerminatorLexeme,
  type KeywordMap,
} from "./config";

export type { KeywordMap, LexerConfig } from "./config";

function isLexerConfig(value: unknown): value is LexerConfig {
  if (!value || typeof value !== "object") return false;
  return (
    "customKeywords" in value ||
    "operatorWordMap" in value ||
    "booleanLiteralMap" in value ||
    "statementTerminatorLexeme" in value ||
    "blockDelimiters" in value ||
    "locale" in value ||
    "indentationBlock" in value ||
    "tabWidth" in value
  );
}

export class Lexer {
  source: string;
  tokens: Token[] = [];
  line = 1;
  column = 1;
  scannerBegin = 0;
  current = 0;
  warnings: IssueWarning[] = [];
  infos: IssueInfo[] = [];
  keywordMap: KeywordMap;
  locale: string | undefined;
  statementTerminatorLexeme: string | undefined;
  private indentationBlock: boolean;
  private tabWidth: number;
  private indentStack: number[] = [0];
  private groupDepth = 0;
  private explicitLineContinuation = false;

  constructor(
    source: string,
    configOrKeywords?: LexerConfig | KeywordMap,
    locale?: string,
  ) {
    this.source = source;

    const config = isLexerConfig(configOrKeywords)
      ? configOrKeywords
      : {
          customKeywords: configOrKeywords,
          locale,
        };

    this.keywordMap = {
      ...(TOKENS.RESERVEDS as KeywordMap),
      ...(config.customKeywords ?? {}),
      ...buildOperatorWordTokenMap(config.operatorWordMap),
      ...buildBooleanLiteralTokenMap(config.booleanLiteralMap),
    };
    this.locale = config.locale;
    this.indentationBlock = config.indentationBlock ?? false;
    this.tabWidth = config.tabWidth ?? 4;
    if (this.tabWidth <= 0) {
      this.error("lexer.invalid_tab_width", { tabWidth: this.tabWidth });
    }

    const delimiters = config.blockDelimiters;
    if (config.operatorWordMap) {
      validateOperatorWordMap(
        config.operatorWordMap,
        TOKENS.RESERVEDS as KeywordMap,
        config.customKeywords,
        delimiters,
      );
    }
    if (config.booleanLiteralMap) {
      validateBooleanLiteralMap(
        config.booleanLiteralMap,
        TOKENS.RESERVEDS as KeywordMap,
        config.customKeywords,
        config.operatorWordMap,
        delimiters,
      );
    }
    if (delimiters) {
      if (this.indentationBlock) {
        this.error("lexer.indentation_disallow_block_delimiters");
      }
      validateBlockDelimiters(delimiters, TOKENS.RESERVEDS as KeywordMap);
      this.keywordMap[delimiters.open] = TOKENS.SYMBOLS.left_brace;
      this.keywordMap[delimiters.close] = TOKENS.SYMBOLS.right_brace;
    }

    const statementTerminatorLexeme = normalizeStatementTerminatorLexeme(
      config.statementTerminatorLexeme,
    );
    this.statementTerminatorLexeme = statementTerminatorLexeme;
    if (config.statementTerminatorLexeme !== undefined) {
      if (!statementTerminatorLexeme) {
        throw new Error("statement terminator cannot be empty");
      }
      validateStatementTerminatorLexeme(statementTerminatorLexeme);
    }
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.scannerBegin = this.current;
      this.scanToken();
    }

    if (this.indentationBlock) {
      this.emitDedentsUntil(0);
    }

    // this.tokens.push(new Token(TOKENS.EOF, "", this.line, this.column));
    return this.tokens;
  }

  public scanToken() {
    const char = this.peekAndAdvance();
    if (
      this.indentationBlock &&
      char === "\\" &&
      (this.peek() === "\n" ||
        (this.peek() === "\r" && this.peekNext() === "\n"))
    ) {
      this.explicitLineContinuation = true;
      return;
    }
    if (isWhitespace(char)) return;
    if (char === "\n") return this.onNewline();

    const scanner = LexerScannerFactory.getInstance(char, this);
    if (scanner) return scanner.run();

    this.error("lexer.unexpected_character", { char });
  }

  public isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  public advance(columns = 1): void {
    this.current += columns;
    this.column += columns;
  }

  public peekAndAdvance(): string {
    const char = this.source[this.current];
    this.advance();
    return char;
  }

  public matchAndAdvance(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;
    this.advance();
    return true;
  }

  /**
   * Add a token to the list of tokens class
   * @param type Token type from TOKENS enum
   * @param lexeme Token lexeme string
   * @param addedChars Number of added chars to the lexeme string (default 0), used to calculate the column position of the beginning of the token
   */
  public addToken(type: number, lexeme?: string, addedChars: number = 0) {
    if (
      this.indentationBlock &&
      (type === TOKENS.SYMBOLS.left_brace ||
        type === TOKENS.SYMBOLS.right_brace)
    ) {
      this.error("lexer.indentation_disallow_braces");
    }

    const text =
      lexeme || this.source.substring(this.scannerBegin, this.current);
    this.tokens.push(
      new Token(type, text, this.line, this.column - text.length + addedChars),
    );
    if (
      type === TOKENS.SYMBOLS.left_paren ||
      type === TOKENS.SYMBOLS.left_brace
    ) {
      this.groupDepth++;
    } else if (
      (type === TOKENS.SYMBOLS.right_paren ||
        type === TOKENS.SYMBOLS.right_brace) &&
      this.groupDepth > 0
    ) {
      this.groupDepth--;
    }
  }

  public peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.current];
  }

  public peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  public peekPrevious(): string {
    if (this.current - 1 < 0) return "\0";
    return this.source[this.current - 1];
  }

  public goToNextLine() {
    this.line++;
    this.column = 1;
  }

  public onNewline(): void {
    this.goToNextLine();
    if (!this.indentationBlock) return;
    if (this.isStructuralSuppressed()) {
      this.explicitLineContinuation = false;
      return;
    }

    if (!this.isAtEnd()) {
      const { depth, nextIndex } = this.readIndentDepth(this.current);
      const currentDepth = this.indentStack[this.indentStack.length - 1];
      const isBlankOrCommentLine = this.isBlankOrCommentLine(nextIndex);
      if (isBlankOrCommentLine) return;

      this.advance(nextIndex - this.current);
      if (this.shouldEmitStructuralNewline()) {
        this.addToken(TOKENS.SYMBOLS.newline, "\n");
      }

      if (depth > currentDepth) {
        const previous = this.getLastSignificantTokenType();
        if (previous !== TOKENS.SYMBOLS.colon) {
          this.error("lexer.unexpected_indent");
        }
        this.indentStack.push(depth);
        this.addToken(TOKENS.SYMBOLS.indent, "<INDENT>");
        return;
      }

      if (depth < currentDepth) {
        this.emitDedentsUntil(depth);
      }
    }
  }

  private readIndentDepth(start: number): { depth: number; nextIndex: number } {
    let index = start;
    let depth = 0;
    let hasSpace = false;
    let hasTab = false;
    while (index < this.source.length) {
      const char = this.source[index];
      if (!isIndentationWhitespace(char)) break;
      hasSpace = hasSpace || char === " ";
      hasTab = hasTab || char === "\t";
      depth += char === "\t" ? this.tabWidth : 1;
      index++;
    }
    if (hasSpace && hasTab) {
      this.error("lexer.inconsistent_indentation");
    }
    return { depth, nextIndex: index };
  }

  private emitDedentsUntil(depth: number): void {
    while (
      this.indentStack.length > 1 &&
      this.indentStack[this.indentStack.length - 1] > depth
    ) {
      this.indentStack.pop();
      this.addToken(TOKENS.SYMBOLS.dedent, "<DEDENT>");
    }
    if (this.indentStack[this.indentStack.length - 1] !== depth) {
      this.error("lexer.invalid_dedent");
    }
  }

  private isStructuralSuppressed(): boolean {
    return this.groupDepth > 0 || this.explicitLineContinuation;
  }

  private isBlankOrCommentLine(index: number): boolean {
    const char = this.source[index];
    if (!char || char === "\n") return true;
    return char === "/" && this.source[index + 1] === "/";
  }

  private shouldEmitStructuralNewline(): boolean {
    if (this.tokens.length === 0) return false;
    const lastType = this.tokens[this.tokens.length - 1].type;
    return (
      lastType !== TOKENS.SYMBOLS.newline &&
      lastType !== TOKENS.SYMBOLS.indent &&
      lastType !== TOKENS.SYMBOLS.dedent
    );
  }

  private getLastSignificantTokenType(): number | null {
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const type = this.tokens[i].type;
      if (
        type !== TOKENS.SYMBOLS.newline &&
        type !== TOKENS.SYMBOLS.indent &&
        type !== TOKENS.SYMBOLS.dedent
      ) {
        return type;
      }
    }
    return null;
  }

  public error(code: string, params?: TIssueParams) {
    const message = translate(this.locale, code, params);
    throw new IssueError(code, message, this.line, this.column, params);
  }

  public warning(code: string, params?: TIssueParams) {
    const message = translate(this.locale, code, params);
    this.warnings.push(
      new IssueWarning(code, message, this.line, this.column, params),
    );
  }

  public info(code: string, params?: TIssueParams) {
    const message = translate(this.locale, code, params);
    this.infos.push(
      new IssueInfo(code, message, this.line, this.column, params),
    );
  }
}
