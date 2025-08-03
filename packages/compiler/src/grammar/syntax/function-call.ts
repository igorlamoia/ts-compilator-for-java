import { TokenIterator } from "../../token/TokenIterator";
import { typeStmt } from "./typeSmt";
import { TOKENS } from "../../token/constants";
import { blockStmt } from "./blockStmt";

/**
 * Processes a function call statement by first parsing a type statement,
 * then parsing an identifier token, and finally parsing a block statement.
 *
 * @derivation `<functionCall> -> <typeStmt> 'IDENT' '(' ')' <blockStmt>`
 */
export function functionCall(iterator: TokenIterator): void {
  const { left_paren, right_paren } = TOKENS.SYMBOLS;
  typeStmt(iterator);
  iterator.consume(TOKENS.LITERALS.identifier);
  iterator.consume(left_paren);
  iterator.consume(right_paren);
  blockStmt(iterator);
}
