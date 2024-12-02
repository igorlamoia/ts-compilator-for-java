import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { stmt } from "./stmt";

// <elsePart> -> 'else' <stmt> | & ;
export function elsePartStmt(iterator: TokenIterator): void {
  if (iterator.match(TOKENS.RESERVEDS.else)) {
    iterator.consume(TOKENS.RESERVEDS.else);
    stmt(iterator);
  }
}
