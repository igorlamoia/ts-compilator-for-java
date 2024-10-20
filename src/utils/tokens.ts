// Operadores Aritméticos
export const ARITHMETICS = {
  PLUS: 1, // +
  MINUS: 2, // -
  STAR: 3, // *
  SLASH: 4, // /
  MODULO: 5, // %
};

// Operadores Lógicos
export const LOGICALS = {
  LOGICAL_OR: 6, // ||
  LOGICAL_AND: 7, // &&
  LOGICAL_NOT: 8, // !
};

// Operadores Relacionais
export const RELATIONALS = {
  EQUAL_EQUAL: 9, // ==
  NOT_EQUAL: 10, // !=
  GREATER: 11, // >
  GREATER_EQUAL: 12, // >=
  LESS: 13, // <
  LESS_EQUAL: 14, // <=
};

// Operadores de Atribuição
export const ASSIGNMENTS = {
  EQUAL: 15, // =
  PLUS_EQUAL: 16, // +=
  MINUS_EQUAL: 17, // -=
  STAR_EQUAL: 18, // *=
  SLASH_EQUAL: 19, // /=
  MODULO_EQUAL: 20, // %=
};

// Palavras Reservadas
export const RESERVEDS = {
  INT: 21,
  FLOAT: 22,
  STRING: 23,
  FOR: 24,
  WHILE: 25,
  BREAK: 26,
  CONTINUE: 27,
  IF: 28,
  ELSE: 29,
  RETURN: 30,
  SYSTEM: 31,
  OUT: 32,
  PRINT: 33,
  IN: 34,
  SCAN: 35,
};

// Símbolos
export const Symbols = {
  SEMICOLON: 36, // ;
  COMMA: 37, // ,
  LEFT_BRACE: 38, // {
  RIGHT_BRACE: 39, // }
  LEFT_PAREN: 40, // (
  RIGHT_PAREN: 41, // )
  DOT: 42, // .
};

// Literais
export const Literals = {
  IDENTIFIER: 43,
  STRING_LITERAL: 44,
  INTEGER_LITERAL: 45,
  FLOAT_LITERAL: 46,
  HEX_LITERAL: 47,
  OCTAL_LITERAL: 48,
};

// Fim de Arquivo
export const EOF = 99;

// TOKENS unificados
export const TOKENS = {
  ...ARITHMETICS,
  ...LOGICALS,
  ...RELATIONALS,
  ...ASSIGNMENTS,
  ...RESERVEDS,
  ...Symbols,
  ...Literals,
  EOF,
};
