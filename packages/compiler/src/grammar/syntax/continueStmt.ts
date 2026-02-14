import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { IssueError } from "../../issue";

/**
 * Parses a continue statement and emits a JUMP to the current loop's continue label.
 *
 * @derivation `continue ;`
 */
export function continueStmt(iterator: TokenIterator): void {
  const continueToken = iterator.consume(TOKENS.RESERVEDS.continue);
  iterator.consume(TOKENS.SYMBOLS.semicolon);

  const continueLabel = iterator.getCurrentContinueLabel();
  if (!continueLabel) {
    throw new IssueError(
      "continue statement outside of loop",
      continueToken.line,
      continueToken.column
    );
  }

  iterator.emitter.emit("JUMP", continueLabel, null, null);
}
