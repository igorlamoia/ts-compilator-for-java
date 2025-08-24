import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { andStmt } from "./andStmt";
/**
 * Parses the rest of the or statement by calling andStmt
 * or does nothing.
 *
 * @derivation `<restoOr> -> '||' <and> <restoOr> | &`
 */
export function restOrStmt(iterator: TokenIterator, inherited: string): string {
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    iterator.consume(TOKENS.LOGICALS.logical_or);
    const right = andStmt(iterator);
    const temp = iterator.emitter.newTemp();

    iterator.emitter.emit("||", temp, inherited, right);
    inherited = temp; // para próxima iteração
  }

  return inherited;
}
