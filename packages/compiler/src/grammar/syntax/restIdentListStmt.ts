import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";

/**
 * Parses the rest of the identifier list statement or does nothing.
 *
 * @derivation `<restIdentListStmt> -> ',' 'IDENT' <restIdentListStmt> | &`
 */
export function restIdentListStmt(iterator: TokenIterator): void {
  while (iterator.match(TOKENS.SYMBOLS.comma)) {
    iterator.consume(TOKENS.SYMBOLS.comma);
    iterator.consume(TOKENS.LITERALS.identifier);
  }
}
