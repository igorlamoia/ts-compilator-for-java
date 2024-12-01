import { TokenIterator } from "token/TokenIterator";
import { addStmt } from "./addStmt";

export function relationalStmt(iterator: TokenIterator): void {
  addStmt(iterator); // Parse the first additive expression
  const validRelationalOps = ["==", "!=", "<", "<=", ">", ">="];
  const token = iterator.peek();
  if (validRelationalOps.includes(token.lexeme)) {
    iterator.next(); // Consume relational operator
    addStmt(iterator); // Parse the second additive expression
  }
}
