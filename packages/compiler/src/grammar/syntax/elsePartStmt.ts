import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";

/**
 * Parses the optional `else` part of an `if` statement.
 *
 * @derivation `<elsePart> -> else <stmt> | ε`
 */
export function elsePartStmt(iterator: TokenIterator): void {
  if (iterator.match(TOKENS.RESERVEDS.else)) {
    iterator.consume(TOKENS.RESERVEDS.else);
    stmt(iterator);
  }
}
