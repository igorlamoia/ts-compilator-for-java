const grammar = {
  unexpected_statement: "Sentencia inesperada: {lexeme}",
  unexpected_type:
    'Tipo inesperado "{lexeme}" en la línea {line}, columna {column}.',
  unexpected_token:
    'Token inesperado "{lexeme}" en la línea {line}, columna {column}.',
  break_outside_loop: "Sentencia break fuera de un bucle",
  continue_outside_loop: "Sentencia continue fuera de un bucle",
  invalid_assignment_operator:
    'Operador de asignación inválido "{lexeme}" en la línea {line}, columna {column}.',
  unexpected_output_token: "Token de salida inesperado: {lexeme}",
  invalid_unary_increment:
    'Uso inválido de incremento unario "{lexeme}" en la línea {line}, columna {column}.',
};

export default grammar;
