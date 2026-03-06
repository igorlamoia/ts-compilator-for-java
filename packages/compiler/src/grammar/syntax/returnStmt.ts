import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { optExprStmt } from "./optExprStmt";
import { consumeStmtTerminator } from "./terminator";

/**
 * Parses a return statement.
 *
 * @derivation `<returnStmt> → return <optExpr> ';'`
 */
export function returnStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.return);

  if (
    !iterator.hasNext() ||
    iterator.match(TOKENS.SYMBOLS.newline) ||
    iterator.match(TOKENS.SYMBOLS.right_brace) ||
    iterator.match(TOKENS.SYMBOLS.semicolon)
  ) {
    consumeStmtTerminator(iterator);
    iterator.emitter.emit("RETURN", "null", null, null);
    return;
  }

  const returnValue = optExprStmt(iterator);
  consumeStmtTerminator(iterator);

  iterator.emitter.emit("RETURN", returnValue || "null", null, null);
}
