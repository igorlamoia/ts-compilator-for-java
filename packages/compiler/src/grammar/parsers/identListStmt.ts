import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { restIdentListStmt } from "./restIdentListStmt";

// <identList> -> 'IDENT' <restoIdentList> ;
export function identListStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.LITERALS.identifier);
  restIdentListStmt(iterator);
}
