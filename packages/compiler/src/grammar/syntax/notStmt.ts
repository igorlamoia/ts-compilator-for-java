import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { relationalStmt } from "./relationalStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses a logical NOT or relational expression.
 *
 * @derivation `<not> -> ! <not> | <rel>`
 */
export function notStmt(iterator: TokenIterator, emitter: Emitter): string {
  const { logical_not } = TOKENS.LOGICALS;

  if (iterator.match(logical_not)) {
    iterator.consume(logical_not);

    const inner = notStmt(iterator, emitter); // chamada recursiva
    const temp = emitter.newTemp();

    emitter.emit("!", temp, inner, null);
    return temp;
  }

  return relationalStmt(iterator, emitter); // fallback: expressão relacional
}
