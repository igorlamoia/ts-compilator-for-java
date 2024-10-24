import { Lexer } from "lexer";
import {
  ARITHMETICS,
  LOGICALS,
  RELATIONALS,
  ASSIGNMENTS,
  SYMBOLS,
} from "./tokens";

type TTokenMap = {
  [key: string]: (lexer: Lexer) => void;
};

export const TOKENS_MAP: TTokenMap = {
  ";": (lexer) => lexer.addToken(SYMBOLS.semicolon),
  ",": (lexer) => lexer.addToken(SYMBOLS.comma),
  "{": (lexer) => lexer.addToken(SYMBOLS.left_brace),
  "}": (lexer) => lexer.addToken(SYMBOLS.right_brace),
  "(": (lexer) => lexer.addToken(SYMBOLS.left_paren),
  ")": (lexer) => lexer.addToken(SYMBOLS.right_paren),
  ".": (lexer) => lexer.addToken(SYMBOLS.dot),
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
  "/": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.slash_equal : ARITHMETICS.slash
    ),
  "%": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.modulo_equal : ARITHMETICS.modulo
    ),
  "!": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.not_equal : LOGICALS.logical_not
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
  "|": (lexer) =>
    lexer.match("|")
      ? lexer.addToken(LOGICALS.logical_or)
      : lexer.error("Caractere inesperado '|'"),
  "&": (lexer) =>
    lexer.match("&")
      ? lexer.addToken(LOGICALS.logical_and)
      : lexer.error("Caractere inesperado '&'"),
};
