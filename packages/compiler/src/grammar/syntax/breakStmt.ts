import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses a break statement and emits a JUMP to the current loop's break label.
 *
 * @derivation `break ;`
 */
export function breakStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.break);
  iterator.consume(TOKENS.SYMBOLS.semicolon);

  const breakLabel = iterator.getCurrentBreakLabel();
  if (!breakLabel) {
    throw new Error("break statement outside of loop");
  }

  iterator.emitter.emit("JUMP", breakLabel, null, null);
}
