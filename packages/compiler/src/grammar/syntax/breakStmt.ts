import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { IssueError } from "../../issue";

/**
 * Parses a break statement and emits a JUMP to the current loop's break label.
 *
 * @derivation `break ;`
 */
export function breakStmt(iterator: TokenIterator): void {
  const breakToken = iterator.consume(TOKENS.RESERVEDS.break);
  iterator.consume(TOKENS.SYMBOLS.semicolon);

  const breakLabel = iterator.getCurrentBreakLabel();
  if (!breakLabel) {
    throw new IssueError(
      "break statement outside of loop",
      breakToken.line,
      breakToken.column
    );
  }

  iterator.emitter.emit("JUMP", breakLabel, null, null);
}
