import { TokenIterator } from "token/TokenIterator";
import { factorStmt } from "./factorStmt";

export function unitaryStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (["+", "-"].includes(token.lexeme)) {
    iterator.next(); // Consume `+` or `-`
    unitaryStmt(iterator);
  } else {
    factorStmt(iterator); // Delegate to factor
  }
}
