import { Emitter } from "../../ir/emitter";
import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { notStmt } from "./notStmt";

/**
 * Parses the rest of the logical and statement.
 * and calls the notStmt function or does nothing.
 *
 * @derivation `<restAndStmt> -> '&&' <notStmt> <restAndStmt> | &`
 */
export function restAndStmt(
  iterator: TokenIterator,
  emitter: Emitter,
  inherited: string
): string {
  const { logical_and } = TOKENS.LOGICALS;
  while (iterator.match(logical_and)) {
    iterator.consume(TOKENS.LOGICALS.logical_and);

    const right = notStmt(iterator, emitter);
    const temp = emitter.newTemp();

    emitter.emit("&&", temp, inherited, right);
    inherited = temp;
  }

  return inherited;
}
