import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses the optional `else` part of an `if` statement.
 *
 * @derivation `<elsePart> -> else <stmt> | ε`
 */
export function elsePartStmt(iterator: TokenIterator, emitter: Emitter): void {
  if (iterator.match(TOKENS.RESERVEDS.else)) {
    iterator.consume(TOKENS.RESERVEDS.else);
    stmt(iterator, emitter);
  }
}
