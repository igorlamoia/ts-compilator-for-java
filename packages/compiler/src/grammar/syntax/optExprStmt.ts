import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";

/**
 * Parses the optional expression statement or nothing.
 *
 * @derivation `<optExprStmt> -> <exprStmt> | &`
 */
export function optExprStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (isStartToken(token.type)) exprStmt(iterator);
}

function isStartToken(type: number): boolean {
  return [
    TOKENS.LITERALS.identifier,
    TOKENS.RESERVEDS.float,
    TOKENS.RESERVEDS.int,
    TOKENS.SYMBOLS.left_brace,
  ].includes(type);
}
