import { Lexer } from "lexer";
import {
  ARITHMETICS,
  LOGICALS,
  RELATIONALS,
  ASSIGNMENTS,
  Symbols,
} from "./tokens";

export const TOKENS_MAP: { [key: string]: (lexer: Lexer) => void } = {
  ";": (lexer) => lexer.addToken(Symbols.SEMICOLON),
  ",": (lexer) => lexer.addToken(Symbols.COMMA),
  "{": (lexer) => lexer.addToken(Symbols.LEFT_BRACE),
  "}": (lexer) => lexer.addToken(Symbols.RIGHT_BRACE),
  "(": (lexer) => lexer.addToken(Symbols.LEFT_PAREN),
  ")": (lexer) => lexer.addToken(Symbols.RIGHT_PAREN),
  ".": (lexer) => lexer.addToken(Symbols.DOT),
  "+": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.PLUS_EQUAL : ARITHMETICS.PLUS
    ),
  "-": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.MINUS_EQUAL : ARITHMETICS.MINUS
    ),
  "*": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.STAR_EQUAL : ARITHMETICS.STAR
    ),
  "/": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.SLASH_EQUAL : ARITHMETICS.SLASH
    ),
  "%": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? ASSIGNMENTS.MODULO_EQUAL : ARITHMETICS.MODULO
    ),
  "!": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.NOT_EQUAL : LOGICALS.LOGICAL_NOT
    ),
  "=": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.EQUAL_EQUAL : ASSIGNMENTS.EQUAL
    ),
  ">": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.GREATER_EQUAL : RELATIONALS.GREATER
    ),
  "<": (lexer) =>
    lexer.addToken(
      lexer.match("=") ? RELATIONALS.LESS_EQUAL : RELATIONALS.LESS
    ),
  "|": (lexer) =>
    lexer.match("|")
      ? lexer.addToken(LOGICALS.LOGICAL_OR)
      : lexer.error("Caractere inesperado '|'"),
  "&": (lexer) =>
    lexer.match("&")
      ? lexer.addToken(LOGICALS.LOGICAL_AND)
      : lexer.error("Caractere inesperado '&'"),
};
