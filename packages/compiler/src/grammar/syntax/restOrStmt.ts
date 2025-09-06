import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { andStmt } from "./andStmt";
/**
 * Parses the rest of a logical OR expression.
 * @returns The final result identifier or temp
 *
 * @derivation `<restoOr> -> '||' <and> <restoOr> | &`
 */
export function restOrStmt(iterator: TokenIterator, inherited: string): string {
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    iterator.consume(TOKENS.LOGICALS.logical_or);
    const right = andStmt(iterator);
    const temp = iterator.emitter.newTemp();

    iterator.emitter.emit("||", temp, inherited, right);
    inherited = temp; // para próxima iteração
  }

  return inherited;
}

// Example: a || b || c
// Results:
// { op: "||", result: "__temp0", operand1: "a", operand2: "b" }
// { op: "||", result: "__temp1", operand1: "__temp0", operand2: "c" }
