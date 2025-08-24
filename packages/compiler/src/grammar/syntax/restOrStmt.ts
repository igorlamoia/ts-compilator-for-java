import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { andStmt } from "./andStmt";
import { Emitter } from "../../ir/emitter";
/**
 * Parses the rest of the or statement by calling andStmt
 * or does nothing.
 *
 * @derivation `<restoOr> -> '||' <and> <restoOr> | &`
 */
export function restOrStmt(
  iterator: TokenIterator,
  emitter: Emitter,
  inherited: string
): string {
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    iterator.consume(TOKENS.LOGICALS.logical_or);
    const right = andStmt(iterator, emitter);
    const temp = emitter.newTemp();

    emitter.emit("||", temp, inherited, right);
    inherited = temp; // para próxima iteração
  }

  return inherited;
}
