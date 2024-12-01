import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outStmt } from "./outStmt";

export function restOutListStmt(iterator: TokenIterator): void {
  const { SYMBOLS } = TOKENS;

  while (iterator.peek().type === SYMBOLS.comma) {
    iterator.next(); // Consume ','
    outStmt(iterator); // Parse the next <out>
  }
}
