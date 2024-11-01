import { TOKENS } from "../constants";
import { TTokenMap } from ".";

const { ARITHMETICS, ASSIGNMENTS, RELATIONALS, LOGICALS } = TOKENS;
export const OPERATORS_TOKENS_MAP: TTokenMap = {
  "+": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? ASSIGNMENTS.plus_equal : ARITHMETICS.plus
    ),
  "-": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? ASSIGNMENTS.minus_equal : ARITHMETICS.minus
    ),
  "*": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? ASSIGNMENTS.star_equal : ARITHMETICS.star
    ),
  "/": (lexer) => {
    const currentChar = lexer.peek();
    if (currentChar === "=") {
      lexer.addToken(ASSIGNMENTS.slash_equal);
      return lexer.advance();
    }

    if (currentChar === "*") {
      while (
        lexer.peekAndAdvance() !== "*" &&
        lexer.peek() !== "/" &&
        !lexer.isAtEnd()
      );
      return;
    }
    if (currentChar === "/") {
      while (lexer.peekAndAdvance() !== "\n" && !lexer.isAtEnd());
      return;
    }
    lexer.addToken(ARITHMETICS.slash);
  },
  "%": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? ASSIGNMENTS.modulo_equal : ARITHMETICS.modulo
    ),
  "=": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? RELATIONALS.equal_equal : ASSIGNMENTS.equal
    ),
  ">": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=")
        ? RELATIONALS.greater_equal
        : RELATIONALS.greater
    ),
  "<": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? RELATIONALS.less_equal : RELATIONALS.less
    ),
  "!": (lexer) =>
    lexer.addToken(
      lexer.matchAndAdvance("=") ? RELATIONALS.not_equal : LOGICALS.logical_not
    ),
  "|": (lexer) =>
    lexer.matchAndAdvance("|")
      ? lexer.addToken(LOGICALS.logical_or)
      : lexer.error("Caractere inesperado '|'"),
  "&": (lexer) =>
    lexer.matchAndAdvance("&")
      ? lexer.addToken(LOGICALS.logical_and)
      : lexer.error("Caractere inesperado '&'"),
};
