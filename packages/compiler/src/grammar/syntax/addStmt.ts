import { TokenIterator } from "../../token/TokenIterator";
import { multStmt } from "./multStmt";
import { restAddStmt } from "./restAddStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses an addition or subtraction expression.
 * Emits code and returns the resulting variable/literal/temp.
 *
 * @derivation `<add> -> <mult> <restoAdd>`
 */
export function addStmt(iterator: TokenIterator, emitter: Emitter): string {
  const left = multStmt(iterator, emitter);
  return restAddStmt(iterator, emitter, left);
}
