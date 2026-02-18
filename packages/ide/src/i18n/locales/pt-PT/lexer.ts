const lexer = {
  unexpected_character: "Carácter inesperado '{char}'",
  unterminated_string_same_line:
    "String não terminada; deve terminar na mesma linha.",
  unterminated_string: "String não terminada.",
  hex_uppercase_x: "O X em números hexadecimais deve ser minúsculo",
  invalid_number: "Número inválido",
  invalid_float_number: "Número decimal inválido",
  invalid_hex_number: "Número hexadecimal inválido",
  invalid_octal_number: "Número octal inválido",
  poorly_written_float_beginning:
    "Número decimal mal escrito, 0 adicionado no início",
  poorly_written_float_end: "Número decimal mal escrito, 0 adicionado no fim",
  unexpected_pipe: "Carácter inesperado '|'",
  unexpected_ampersand: "Carácter inesperado '&'",
};

export default lexer;
