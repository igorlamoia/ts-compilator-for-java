import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { multStmt } from "./multStmt";
import { Emitter } from "../../ir/emitter";
import { TArithmetics } from "../../interpreter/constants";

/**
 * Parses the rest of an addition/subtraction chain.
 * Emits code and returns the final result variable.
 *
 * @param iterator Token stream
 * @param emitter Code emitter
 * @param inherited The left-hand value
 */
export function restAddStmt(
  iterator: TokenIterator,
  emitter: Emitter,
  inherited: string
): string {
  const { plus, minus } = TOKENS.ARITHMETICS;

  while ([minus, plus].includes(iterator.peek().type)) {
    const token = iterator.peek();
    const op: "+" | "-" = token.type === plus ? "+" : "-";
    iterator.consume(token.type); // consume '+' or '-'
    const right = multStmt(iterator, emitter);
    const temp = emitter.newTemp();
    emitter.emit(op, temp, inherited, right);
    inherited = temp; // carry to next round
  }

  return inherited;
}
