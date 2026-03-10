import { ExprResult, TokenIterator, ValueType } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { argumentListStmt } from "./argumentListStmt";
import { Token } from "../../token";

/**
 * Parses a function call expression.
 * The function name has already been consumed before calling this function.
 *
 * @param iterator TokenIterator instance
 * @param functionName Name of the function being called
 * @returns Temporary variable containing the return value
 *
 * @derivation `<functionCallExpr> → IDENT '(' <argList> ')'`
 */
export function functionCallExpr(
  iterator: TokenIterator,
  functionName: Token,
): ExprResult {
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const args = argumentListStmt(iterator);

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  const resultTemp = iterator.emitter.newTemp();
  const signature = iterator.resolveFunction(functionName.lexeme);

  if (signature) {
    args.forEach((arg, index) => {
      const expectedType = signature.params[index] ?? "unknown";
      iterator.warnIfLossyIntConversion(expectedType, arg.type, arg.token);
    });
  }

  iterator.emitter.emit(
    "CALL",
    functionName.lexeme,
    args.map((arg) => arg.place),
    resultTemp,
  );
  const returnType: ValueType = signature?.returnType ?? "unknown";
  iterator.registerTemp(resultTemp, returnType);

  return iterator.createExprResult(resultTemp, returnType, functionName);
}
