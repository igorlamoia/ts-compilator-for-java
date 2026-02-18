const grammar = {
  unexpected_statement: "Comando inesperado: {lexeme}",
  unexpected_type:
    'Tipo inesperado "{lexeme}" na linha {line}, coluna {column}.',
  unexpected_token:
    'Token inesperado "{lexeme}" na linha {line}, coluna {column}.',
  break_outside_loop: "Comando break fora de um loop",
  continue_outside_loop: "Comando continue fora de um loop",
  invalid_assignment_operator:
    'Operador de atribuição inválido "{lexeme}" na linha {line}, coluna {column}.',
  unexpected_output_token: "Token de saída inesperado: {lexeme}",
  invalid_unary_increment:
    'Uso inválido de incremento unário "{lexeme}" na linha {line}, coluna {column}.',
};

export default grammar;
