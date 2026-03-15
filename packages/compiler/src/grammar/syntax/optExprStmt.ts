import { TOKENS } from "../../token/constants";
import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";

/**
 * Parses an optional expression.
 * @returns The result of the expression or null (ε)
 *
 * @derivation `<optExpr> → <expr> | ε`
 */
export function optExprStmt(iterator: TokenIterator): ExprResult | null {
  const token = iterator.peek();
  if (isStartToken(token.type)) {
    return exprStmt(iterator);
  }

  return null; // produção vazia
}
function isStartToken(type: number): boolean {
  return [
    TOKENS.LITERALS.identifier,
    TOKENS.LITERALS.string_literal,
    TOKENS.LITERALS.integer_literal,
    TOKENS.LITERALS.float_literal,
    TOKENS.LITERALS.hex_literal,
    TOKENS.LITERALS.octal_literal,
    TOKENS.RESERVEDS.true,
    TOKENS.RESERVEDS.false,
    TOKENS.SYMBOLS.left_paren,
    TOKENS.ARITHMETICS.plus,
    TOKENS.ARITHMETICS.minus,
    TOKENS.LOGICALS.logical_not,
  ].includes(type);
}
