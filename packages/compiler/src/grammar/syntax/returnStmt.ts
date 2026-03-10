import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { optExprStmt } from "./optExprStmt";
import { consumeStmtTerminator } from "./statementTerminator";

/**
 * Parses a return statement.
 *
 * @derivation `<returnStmt> → return <optExpr> ';'`
 */
export function returnStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.RESERVEDS.return);

  // Parsear expressão de retorno (opcional)
  const returnValue = optExprStmt(iterator);
  const functionReturnType = iterator.getCurrentFunctionReturnType();

  if (returnValue && functionReturnType) {
    iterator.warnIfLossyIntConversion(
      functionReturnType,
      returnValue.type,
      returnValue.token,
    );
  }

  consumeStmtTerminator(iterator);

  iterator.emitter.emit(
    "RETURN",
    returnValue?.place || "null",
    functionReturnType,
    null,
  );
}
