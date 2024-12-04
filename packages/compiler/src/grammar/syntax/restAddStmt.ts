import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";

/**
 * Parses the rest of the addition statement.
 * and calls the multStmt function or does nothing.
 *
 * @derivation `<restAddStmt> -> '+' <multStmt> <restAddStmt> | '-' <multStmt> <restAddStmt> | &`
 */
export function restAddStmt(iterator: TokenIterator): void {
  const { minus, plus } = TOKENS.ARITHMETICS;
  while ([minus, plus].includes(iterator.peek().type)) {
    iterator.consume(iterator.peek().type);
    multStmt(iterator);
  }
}
