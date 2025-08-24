import { TokenIterator } from "../../token/TokenIterator";
import { notStmt } from "./notStmt";
import { restAndStmt } from "./restAndStmt";

/**
 * Parses a logical AND expression and returns the result variable/temp.
 *
 * @derivation `<and> -> <not> <restoAnd>`
 */
export function andStmt(iterator: TokenIterator): string {
  const left = notStmt(iterator);
  return restAndStmt(iterator, left);
}

// Example: a && b && c
// { op: "&&", result: "__temp0", operand1: "a", operand2: "b" }
// { op: "&&", result: "__temp1", operand1: "__temp0", operand2: "c" }
