import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { attributeStmt } from "./attributeStmt";

export function optAttributeStmt(iterator: TokenIterator): void {
  if (iterator.peek().type !== TOKENS.SYMBOLS.semicolon) {
    attributeStmt(iterator);
  }
}
