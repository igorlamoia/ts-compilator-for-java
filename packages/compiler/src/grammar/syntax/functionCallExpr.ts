import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { argumentListStmt } from "./argumentListStmt";

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
export function functionCallExpr(iterator: TokenIterator, functionName: string): string {
  // functionName já foi consumido antes de chamar esta função
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  // Parsear lista de argumentos
  const args = argumentListStmt(iterator);

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  // Criar temporário para o resultado da função
  const resultTemp = iterator.emitter.newTemp();

  // Emitir chamada de função
  // operand1: array de argumentos
  // operand2: variável que recebe o retorno
  iterator.emitter.emit("CALL", functionName, args, resultTemp);

  return resultTemp;
}
