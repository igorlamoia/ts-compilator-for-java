import { TOKENS } from "token/constants";
import { TokenIterator } from "token/TokenIterator";
import { restIdentListStmt } from "./restIdentListStmt";

export function identListStmt(iterator: TokenIterator): void {
  iterator.consume(TOKENS.LITERALS.identifier);
  restIdentListStmt(iterator); // Parse the rest of the identifier list
}
