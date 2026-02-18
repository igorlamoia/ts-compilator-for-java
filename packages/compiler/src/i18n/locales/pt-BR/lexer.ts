const lexer = {
  unexpected_character: "Caractere inesperado '{char}'",
  unterminated_string_same_line:
    "String não terminada; deve terminar na mesma linha.",
  unterminated_string: "String não terminada.",
  hex_uppercase_x: "O X em números hexadecimais deve ser minúsculo",
  invalid_number: "Número inválido",
  invalid_float_number: "Número de ponto flutuante inválido",
  invalid_hex_number: "Número hexadecimal inválido",
  invalid_octal_number: "Número octal inválido",
  poorly_written_float_beginning:
    "Número de ponto flutuante mal escrito, 0 adicionado no início",
  poorly_written_float_end:
    "Número de ponto flutuante mal escrito, 0 adicionado no final",
  unexpected_pipe: "Caractere inesperado '|'",
  unexpected_ampersand: "Caractere inesperado '&'",
};

export default lexer;
