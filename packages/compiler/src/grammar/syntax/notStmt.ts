import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { relationalStmt } from "./relationalStmt";

/**
 * Parses the logical NOT statement.
 * and calls the relationalStmt function.
 *
 * @derivation `<not> -> '!' <not> | <rel>`
 */
export function notStmt(iterator: TokenIterator): void {
  const { logical_not } = TOKENS.LOGICALS;
  if (iterator.match(logical_not)) {
    iterator.consume(logical_not);
    notStmt(iterator);
  } else relationalStmt(iterator);
}
