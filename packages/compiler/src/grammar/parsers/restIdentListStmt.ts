import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";

export function restIdentListStmt(iterator: TokenIterator): void {
  while (iterator.match(TOKENS.SYMBOLS.comma)) {
    iterator.next(); // Consume ','
    iterator.consume(TOKENS.LITERALS.identifier); // Expect another identifier
  }
}
