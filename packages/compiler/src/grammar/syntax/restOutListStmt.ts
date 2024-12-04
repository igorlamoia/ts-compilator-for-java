import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";

/**
 * Parses the rest of the out list statement by calling outStmt
 * or does nothing.
 *
 * @derivation `<restoOutList> -> ',' <out> <restoOutList> | &`
 */
export function restOutListStmt(iterator: TokenIterator): void {
  const { SYMBOLS } = TOKENS;

  while (iterator.match(SYMBOLS.comma)) {
    iterator.consume(SYMBOLS.comma);
    outStmt(iterator);
  }
}
