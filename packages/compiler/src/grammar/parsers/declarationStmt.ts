import { TOKENS } from "../../token/constants";
import { typeStmt } from "./typeSmt";
import { identListStmt } from "./identListStmt";
import { TokenIterator } from "../../token/TokenIterator";

// <declaration> -> <type> <identList> ';' ;
export function declarationStmt(iterator: TokenIterator): void {
  typeStmt(iterator); // Parse the type
  identListStmt(iterator); // Parse the identifier list
  iterator.consume(TOKENS.SYMBOLS.semicolon);
}
