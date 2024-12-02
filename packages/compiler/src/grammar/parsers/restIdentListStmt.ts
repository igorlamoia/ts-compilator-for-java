import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";

// <restoIdentList> -> ',' 'IDENT' <restoIdentList> | & ;
export function restIdentListStmt(iterator: TokenIterator): void {
  while (iterator.match(TOKENS.SYMBOLS.comma)) {
    iterator.consume(TOKENS.SYMBOLS.comma);
    iterator.consume(TOKENS.LITERALS.identifier);
  }
}
