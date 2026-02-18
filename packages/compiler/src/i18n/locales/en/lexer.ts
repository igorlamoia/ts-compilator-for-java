const lexer = {
  unexpected_character: "Unexpected character '{char}'",
  unterminated_string_same_line:
    "Unterminated string; it must end on the same line.",
  unterminated_string: "Unterminated string.",
  hex_uppercase_x: "The X in hexadecimal numbers must be lowercase",
  invalid_number: "Invalid number",
  invalid_float_number: "Invalid float number",
  invalid_hex_number: "Invalid hex number",
  invalid_octal_number: "Invalid octal number",
  poorly_written_float_beginning:
    "Poorly written float number, 0 added at the beginning",
  poorly_written_float_end: "Poorly written float number, 0 added at the end",
  unexpected_pipe: "Unexpected character '|'",
  unexpected_ampersand: "Unexpected character '&'",
};

export default lexer;
