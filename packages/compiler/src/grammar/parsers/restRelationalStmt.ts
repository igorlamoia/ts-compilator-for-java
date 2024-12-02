import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { addStmt } from "./addStmt";

// <restoRel> -> '==' <add> | '!=' <add>
// | '<' <add> | '<=' <add>
// | '>' <add> | '>=' <add> | & ;
export function restRelationalStmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  if (Object.values(TOKENS.RELATIONALS).includes(token.type)) {
    iterator.consume(token.type);
    addStmt(iterator);
  }
}
