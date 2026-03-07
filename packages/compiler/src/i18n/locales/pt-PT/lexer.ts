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
  indentation_disallow_block_delimiters:
    "A configuração de delimitadores de bloco não pode ser usada no modo por indentação",
  indentation_disallow_braces:
    "Chavetas não são permitidas quando o modo por indentação está ativo",
  inconsistent_indentation:
    "A indentação não pode misturar tabs e espaços no mesmo prefixo de linha",
  invalid_dedent: "Destino de dedent inválido",
  unexpected_indent: "Aumento inesperado de indentação",
  invalid_tab_width: "tabWidth deve ser maior que 0",
};

export default lexer;
