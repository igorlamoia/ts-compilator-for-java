import { TOKENS } from "../token/constants";
import { Instruction, OpName,TArithmetics } from "../interpreter/constants";
import { Token } from "../token";

const {
  ARITHMETICS,
  ASSIGNMENTS,
  LITERALS,
  SYMBOLS,
  RESERVEDS
} = TOKENS; // ajuste o caminho conforme necessário

export class IntermediateCodeGenerator {
  private tokens: Token[];
  private current = 0;
  private instructions: Instruction[] = [];
  private tempCounter = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public generate(): Instruction[] {
    this.instructions = [];
    this.current = 0;
    this.tempCounter = 0;

    while (!this.isAtEnd()) {
      this.statement();
    }

    this.emit("CALL", "STOP", null, null); // Finaliza o programa
    return this.instructions;
  }

  private statement(): void {
    console.log(`Assignment detected: ${this.peek().lexeme}`);
    if (
      this.match(LITERALS.identifier) &&
      this.check(ASSIGNMENTS.equal)
    ) {
      this.assignment();
    } else if (
      this.checkSequence(
        RESERVEDS.system,
        SYMBOLS.dot,
        RESERVEDS.out,
        SYMBOLS.dot,
        RESERVEDS.print
      )
    ) {
      this.advance(); // system
      this.advance(); // .
      this.advance(); // out
      this.advance(); // .
      this.advance(); // print
      this.printStatement();
    } else {
      throw new Error(
        `Unexpected token at line ${this.peek().line}: ${this.peek().lexeme}`
      );
    }
  }

  private checkSequence(...types: number[]): boolean {
    for (let i = 0; i < types.length; i++) {
      const index = this.current + i;
      if (index >= this.tokens.length || this.tokens[index].type !== types[i]) {
        return false;
      }
    }
    return true;
  }


  private printStatement(): void {
    this.consume(SYMBOLS.left_paren, "Expected '(' after 'print'");

    const token = this.advance();

    if (token.type === LITERALS.string_literal) {
      const raw = token.lexeme;
      this.emit("CALL", "PRINT", raw, null);

    } else if (token.type === LITERALS.identifier) {
      this.emit("CALL", "PRINT", null, token.lexeme);

    } else {
      throw new Error(`Unsupported print argument: ${token.lexeme}`);
    }

    this.consume(SYMBOLS.right_paren, "Expected ')' after print argument");
    this.consume(SYMBOLS.semicolon, "Expected ';' after print statement");
  }


  private assignment(): void {
    const identifier = this.previous().lexeme;
    this.advance(); // consome '='
    const tempResult = this.expression(); // RHS
    this.emit("=", identifier, tempResult, null);
    this.consume(SYMBOLS.semicolon, "Expected ';' after assignment.");
  }

  private expression(): string {
    return this.term(); // por enquanto
  }

  private term(): string {
    let left = this.factor();

    while (
      this.match(ARITHMETICS.plus, ARITHMETICS.minus)
    ) {
      const operator = this.previous().type === ARITHMETICS.plus ? "+" : "-";
      const right = this.factor();
      const temp = this.newTemp();
      this.emit(operator as TArithmetics, temp, left, right);
      left = temp;
    }

    return left;
  }

  private factor(): string {
    let left = this.primary();

    while (
      this.match(ARITHMETICS.star, ARITHMETICS.slash, ARITHMETICS.modulo)
    ) {
      const opType = this.previous().type;
      const operator =
        opType === ARITHMETICS.star ? "*" :
        opType === ARITHMETICS.slash ? "/" :
        "%";
      const right = this.primary();
      const temp = this.newTemp();
      this.emit(operator as TArithmetics, temp, left, right);
      left = temp;
    }

    return left;
  }

  private primary(): string {
    const token = this.advance();
    if (
      token.type === LITERALS.identifier ||
      token.type === LITERALS.integer_literal ||
      token.type === LITERALS.float_literal ||
      token.type === LITERALS.hex_literal ||
      token.type === LITERALS.octal_literal
    ) {
      return token.lexeme;
    }

    throw new Error(`Unexpected token in expression: ${token.lexeme}`);
  }

  // === Helpers ===

  private emit(
    op: OpName,
    result: string,
    operand1: string | number | boolean | null,
    operand2: string | number | boolean | null
  ) {
    this.instructions.push({ op, result, operand1, operand2 });
  }

  private newTemp(): string {
    return `__temp${this.tempCounter++}`;
  }

  private match(...types: number[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: number, errorMsg: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${errorMsg} (got '${this.peek().lexeme}')`);
  }

  private check(type: number): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }
}