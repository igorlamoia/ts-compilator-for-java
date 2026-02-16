const lexer = {
  unexpected_character: "Carácter inesperado '{char}'",
  unterminated_string_same_line:
    "Cadena sin terminar; debe terminar en la misma línea.",
  unterminated_string: "Cadena sin terminar.",
  hex_uppercase_x: "La X en números hexadecimales debe ser minúscula",
  invalid_number: "Número inválido",
  invalid_float_number: "Número de coma flotante inválido",
  invalid_hex_number: "Número hexadecimal inválido",
  invalid_octal_number: "Número octal inválido",
  poorly_written_float_beginning:
    "Número de coma flotante mal escrito, se añadió 0 al inicio",
  poorly_written_float_end:
    "Número de coma flotante mal escrito, se añadió 0 al final",
  unexpected_pipe: "Carácter inesperado '|'",
  unexpected_ampersand: "Carácter inesperado '&'",
};

export default lexer;
