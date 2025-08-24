import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { factorStmt } from "./factorStmt";
import { Emitter } from "../../ir/emitter";
import { TUnaryArithmetics } from "../../interpreter/constants";

/**
 * Parses a unary expression or factor.
 * Emits code when needed and returns the result.
 *
 * @returns A variable, literal or temporary name
 */
export function unitaryStmt(iterator: TokenIterator, emitter: Emitter): string {
  const token = iterator.peek();
  const { minus, plus } = TOKENS.ARITHMETICS;

  if (token.type === plus || token.type === minus) {
    const operator = token.type === plus ? "unary+" : "unary-";
    iterator.consume(token.type);

    const value = unitaryStmt(iterator, emitter);
    const temp = emitter.newTemp();
    emitter.emit(operator as TUnaryArithmetics, temp, value, null);
    return temp;
  }

  return factorStmt(iterator, emitter); // no operador unário: delega ao fator
}
