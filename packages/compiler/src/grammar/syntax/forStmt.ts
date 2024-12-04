import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { stmt } from "./stmt";
import { optExprStmt } from "./optExprStmt";
import { optAttributeStmt } from "./optAttributeStmt";

/**
 * Processes a for statement by first parsing the reserved word 'for',
 * then parsing an optional attribute -> expression -> optional attribute statement, and finally parsing a statement.
 *
 * @derivation `<forStmt> -> 'for' '(' <optAtrib> ';' <optExpr> ';' <optAtrib> ')' <stmt>`
 */
export function forStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.for);
  const { left_paren, right_paren, semicolon } = TOKENS.SYMBOLS;
  iterator.consume(left_paren);
  optAttributeStmt(iterator);
  iterator.consume(semicolon);
  optExprStmt(iterator);
  iterator.consume(semicolon);
  optAttributeStmt(iterator);
  iterator.consume(right_paren);
  stmt(iterator);
}