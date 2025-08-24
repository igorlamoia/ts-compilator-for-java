import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { listStmt } from "./listStmt";
import { Emitter } from "../../ir/emitter";
/**
 * Processes a block statement by parsing a list of statements.
 *
 * @derivation `<blockStmt> -> '{' <stmtList> '}'`
 */
export function blockStmt(iterator: TokenIterator, emitter: Emitter): void {
  const { left_brace, right_brace } = TOKENS.SYMBOLS;
  iterator.consume(left_brace);
  listStmt(iterator, emitter);
  iterator.consume(right_brace);
}
