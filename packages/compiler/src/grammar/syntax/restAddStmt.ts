import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { multStmt } from "./multStmt";

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
  inherited: string
): string {
  const { plus, minus } = TOKENS.ARITHMETICS;

  while ([minus, plus].includes(iterator.peek().type)) {
    const token = iterator.peek();
    const op: "+" | "-" = token.type === plus ? "+" : "-";
    iterator.consume(token.type); // consume '+' or '-'
    const right = multStmt(iterator);
    const temp = iterator.emitter.newTemp();
    iterator.emitter.emit(op, temp, inherited, right);
    inherited = temp; // carry to next round
  }

  return inherited;
}
