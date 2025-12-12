import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { optExprStmt } from "./optExprStmt";

/**
 * Parses a return statement.
 *
 * @derivation `<returnStmt> → return <optExpr> ';'`
 */
export function returnStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.return);

  // Parsear expressão de retorno (opcional)
  const returnValue = optExprStmt(iterator);

  iterator.consume(TOKENS.SYMBOLS.semicolon);

  // Emitir instrução RETURN
  iterator.emitter.emit("RETURN", returnValue || "null", null, null);
}
