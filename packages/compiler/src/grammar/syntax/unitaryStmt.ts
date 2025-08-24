import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { factorStmt } from "./factorStmt";
import { TUnaryArithmetics } from "../../interpreter/constants";

/**
 * Parses a unary expression or factor.
 * Emits code when needed and returns the result.
 *
 * @returns A variable, literal or temporary name
 */
export function unitaryStmt(iterator: TokenIterator): string {
  const token = iterator.peek();
  const { minus, plus } = TOKENS.ARITHMETICS;

  if (token.type === plus || token.type === minus) {
    const operator = token.type === plus ? "unary+" : "unary-";
    iterator.consume(token.type);

    const value = unitaryStmt(iterator);
    const temp = iterator.emitter.newTemp();
    iterator.emitter.emit(operator as TUnaryArithmetics, temp, value, null);
    return temp;
  }

  return factorStmt(iterator); // no operador unário: delega ao fator
}

// Example: -x
// { op: "unary-", result: "__temp0", operand1: "x", operand2: null }
// Example: -(-a)
// { op: "unary-", result: "__temp0", operand1: "a", operand2: null }
// { op: "unary-", result: "__temp1", operand1: "__temp0", operand2: null }
