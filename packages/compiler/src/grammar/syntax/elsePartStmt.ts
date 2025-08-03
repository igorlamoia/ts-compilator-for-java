import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";

/**
 * Processes an else part statement by first parsing the reserved word 'else'
 * and then parsing a statement or doing nothing (&).
 *
 * @derivation `<elsePart> -> 'else' <stmt> | &`
 */
export function elsePartStmt(iterator: TokenIterator): void {
  if (iterator.match(TOKENS.RESERVEDS.else)) {
    iterator.consume(TOKENS.RESERVEDS.else);
    stmt(iterator);
  }
}
