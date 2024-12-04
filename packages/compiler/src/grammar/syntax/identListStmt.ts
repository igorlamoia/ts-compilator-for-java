import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { restIdentListStmt } from "./restIdentListStmt";

/**
 * Processes an identifier list statement by first parsing an identifier token
 * and then parsing the rest of the identifier list.
 *
 * @derivation `<identList> -> 'IDENT' <restoIdentList>`
 */
export function identListStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.LITERALS.identifier);
  restIdentListStmt(iterator);
}
