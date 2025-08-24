import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";
import { restAddStmt } from "./restAddStmt";

/**
 * Parses an addition or subtraction expression.
 * Emits code and returns the resulting variable/literal/temp.
 *
 * @derivation `<add> -> <mult> <restoAdd>`
 */
export function addStmt(iterator: TokenIterator): string {
  const left = multStmt(iterator);
  return restAddStmt(iterator, left);
}
