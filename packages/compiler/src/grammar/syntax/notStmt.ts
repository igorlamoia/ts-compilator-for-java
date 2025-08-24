import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { relationalStmt } from "./relationalStmt";

/**
 * Parses a logical NOT or relational expression.
 *
 * @derivation `<not> -> ! <not> | <rel>`
 */
export function notStmt(iterator: TokenIterator): string {
  const { logical_not } = TOKENS.LOGICALS;

  if (iterator.match(logical_not)) {
    iterator.consume(logical_not);

    const inner = notStmt(iterator); // chamada recursiva
    const temp = iterator.emitter.newTemp();

    iterator.emitter.emit("!", temp, inner, null);
    return temp;
  }

  return relationalStmt(iterator); // fallback: expressão relacional
}
