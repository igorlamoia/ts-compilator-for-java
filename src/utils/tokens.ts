// Operadores Aritméticos
export const ARITHMETICS = {
  plus: 1, // +
  minus: 2, // -
  star: 3, // *
  slash: 4, // /
  modulo: 5, // %
};

// Operadores Lógicos
export const LOGICALS = {
  logical_or: 6, // ||
  logical_and: 7, // &&
  logical_not: 8, // !
};

// Operadores Relacionais
export const RELATIONALS = {
  equal_equal: 9, // ==
  not_equal: 10, // !=
  greater: 11, // >
  greater_equal: 12, // >=
  less: 13, // <
  less_equal: 14, // <=
};

// Operadores de Atribuição
export const ASSIGNMENTS = {
  equal: 15, // =
  plus_equal: 16, // +=
  minus_equal: 17, // -=
  star_equal: 18, // *=
  slash_equal: 19, // /=
  modulo_equal: 20, // %=
};

// Palavras Reservadas
export const RESERVEDS = {
  int: 21,
  float: 22,
  string: 23,
  for: 24,
  while: 25,
  break: 26,
  continue: 27,
  if: 28,
  else: 29,
  return: 30,
  system: 31,
  out: 32,
  print: 33,
  in: 34,
  scan: 35,
};

// Símbolos
export const SYMBOLS = {
  semicolon: 36, // ;
  comma: 37, // ,
  left_brace: 38, // {
  right_brace: 39, // }
  left_paren: 40, // (
  right_paren: 41, // )
  dot: 42, // .
};

// Literais
export const LITERALS = {
  identifier: 43,
  string_literal: 44,
  integer_literal: 45,
  float_literal: 46,
  hex_literal: 47,
  octal_literal: 48,
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
  ...SYMBOLS,
  ...LITERALS,
  EOF,
};
