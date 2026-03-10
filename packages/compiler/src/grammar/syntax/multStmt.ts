import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { restMultStmt } from "./restMultStmt";
import { unitaryStmt } from "./unitaryStmt";
/**
 *  Parses a multiplication/division/modulo expression.
 *
 * @derivation `<multStmt> -> <unitaryStmt> <restMultStmt>`
 * @returns A string representing the result of the expression
 */
export function multStmt(iterator: TokenIterator): ExprResult {
  const left = unitaryStmt(iterator);
  return restMultStmt(iterator, left);
}
