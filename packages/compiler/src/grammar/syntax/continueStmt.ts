import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

/**
 * Parses a continue statement and emits a JUMP to the current loop's continue label.
 *
 * @derivation `continue ;`
 */
export function continueStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.continue);
  iterator.consume(TOKENS.SYMBOLS.semicolon);

  const continueLabel = iterator.getCurrentContinueLabel();
  if (!continueLabel) {
    throw new Error("continue statement outside of loop");
  }

  iterator.emitter.emit("JUMP", continueLabel, null, null);
}
