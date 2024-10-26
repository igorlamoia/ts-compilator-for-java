export class Token {
  type: number;
  lexeme: string;
  line: number;
  column: number;

  constructor(type: number, lexeme: string, line: number, column: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, "${this.lexeme}", Linha: ${this.line}, Coluna: ${this.column})`;
  }

  toObject() {
    return {
      type: this.type,
      lexeme: this.lexeme,
      line: this.line,
      column: this.column,
    };
  }

  toArrayOfStrings() {
    return [
      this.type.toString(),
      this.lexeme,
      this.line.toString(),
      this.column.toString(),
    ];
  }
}
