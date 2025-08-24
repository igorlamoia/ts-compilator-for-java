import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { unitaryStmt } from "./unitaryStmt";
import { Emitter } from "../../ir/emitter";
import { TArithmetics } from "../../interpreter/constants";

/**
 * Parses the rest of a multiplication/division/modulo chain.
 * Emits intermediate code and returns the result.
 *
 * @param iterator The token iterator
 * @param emitter The instruction emitter
 * @param inherited The left-hand value to chain
 * @returns Final result as variable/literal/temp
 */
export function restMultStmt(
  iterator: TokenIterator,
  emitter: Emitter,
  inherited: string
): string {
  const { star, slash, modulo } = TOKENS.ARITHMETICS;

  while (true) {
    const token = iterator.peek();
    let op: TArithmetics | null = null;

    if (token.type === star) op = "*";
    else if (token.type === slash) op = "/";
    else if (token.type === modulo) op = "%";

    if (!op) break;

    iterator.consume(token.type); // consume '*', '/', '%'
    const right = unitaryStmt(iterator, emitter);
    const temp = emitter.newTemp();
    emitter.emit(op, temp, inherited, right);
    inherited = temp;
  }

  return inherited;
}
