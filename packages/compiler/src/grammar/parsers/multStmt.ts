import { TokenIterator } from "../../token/TokenIterator";
import { unitaryStmt } from "./unitaryStmt";

export function multStmt(iterator: TokenIterator): void {
  unitaryStmt(iterator); // Parse the first unitary expression
  while (["*", "/", "%"].includes(iterator.peek().lexeme)) {
    iterator.next(); // Consume `*`, `/`, or `%`
    unitaryStmt(iterator); // Parse the next unitary expression
  }
}
