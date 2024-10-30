import { TOKENS } from "../constants";
import { TTokenMap } from ".";

const { ARITHMETICS, ASSIGNMENTS, RELATIONALS, LOGICALS } = TOKENS;
export const OPERATORS_TOKENS_MAP: TTokenMap = {
  "+": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.plus_equal : ARITHMETICS.plus
    ),
  "-": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.minus_equal : ARITHMETICS.minus
    ),
  "*": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.star_equal : ARITHMETICS.star
    ),
  "/": (lexer) => {
    if(lexer.match("=")) return  lexer.addToken(ASSIGNMENTS.slash_equal);
    if(lexer.match("/")) return lexer.goToNextLine();
    lexer.addToken( ARITHMETICS.slash);
  },
  "%": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.modulo_equal : ARITHMETICS.modulo
    ),
  "=": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.equal_equal : ASSIGNMENTS.equal
    ),
  ">": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.greater_equal : RELATIONALS.greater
    ),
  "<": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.less_equal : RELATIONALS.less
    ),
  "!": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.not_equal : LOGICALS.logical_not
    ),
  "|": (lexer) =>
    lexer.match("|")
      ? lexer.addToken(LOGICALS.logical_or)
      : lexer.error("Caractere inesperado '|'"),
  "&": (lexer) =>
    lexer.match("&")
      ? lexer.addToken(LOGICALS.logical_and)
      : lexer.error("Caractere inesperado '&'"),
};
