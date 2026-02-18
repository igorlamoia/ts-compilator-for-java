const grammar = {
  unexpected_statement: "Instrução inesperada: {lexeme}",
  unexpected_type:
    'Tipo inesperado "{lexeme}" na linha {line}, coluna {column}.',
  unexpected_token:
    'Token inesperado "{lexeme}" na linha {line}, coluna {column}.',
  break_outside_loop: "Instrução break fora de um ciclo",
  continue_outside_loop: "Instrução continue fora de um ciclo",
  invalid_assignment_operator:
    'Operador de atribuição inválido "{lexeme}" na linha {line}, coluna {column}.',
  unexpected_output_token: "Token de saída inesperado: {lexeme}",
  invalid_unary_increment:
    'Uso inválido de incremento unário "{lexeme}" na linha {line}, coluna {column}.',
};

export default grammar;
