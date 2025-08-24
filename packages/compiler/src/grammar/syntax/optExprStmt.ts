import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";

/**
 * Parses an optional expression.
 * @returns The result of the expression or null (ε)
 *
 * @derivation `<optExpr> → <expr> | ε`
 */
export function optExprStmt(iterator: TokenIterator): string | null {
  const token = iterator.peek();
  if (isStartToken(token.type)) {
    return exprStmt(iterator);
  }

  return null; // produção vazia
}
function isStartToken(type: number): boolean {
  return [
    TOKENS.LITERALS.identifier,
    TOKENS.RESERVEDS.float,
    TOKENS.RESERVEDS.int,
    TOKENS.SYMBOLS.left_brace, // TODO voltar aqui pra saber se tem left brace ou não de vdd? TOKENS.SYMBOLS.left_paren,
  ].includes(type);
}
