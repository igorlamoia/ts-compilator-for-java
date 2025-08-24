import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { addStmt } from "./addStmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses the rest of the relational statement by calling addStmt
 * or does nothing.
 *
 * @derivation `<restoRel> -> '==' <add> | '!=' <add> | '<' <add> | '<=' <add> | '>' <add> | '>=' <add> | &`
 */
export function restRelationalStmt(
  iterator: TokenIterator,
  emitter: Emitter,
  inherited: string
): string {
  const token = iterator.peek();
  const operator = TOKENS.RELATIONAL_SYMBOLS[token.type] ?? null;
  if (operator) {
    iterator.consume(token.type);
    const right = addStmt(iterator, emitter);
    const temp = emitter.newTemp();
    emitter.emit(operator, temp, inherited, right);
    return temp;
  }
  return inherited;
}
