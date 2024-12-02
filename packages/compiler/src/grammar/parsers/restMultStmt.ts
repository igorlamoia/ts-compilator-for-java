import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { unitaryStmt } from "./unitaryStmt";

// <restoMult> -> '\*' <uno> <restoMult>
// | '/' <uno> <restoMult>
// | '%' <uno> <restoMult> | & ;
export function restMultStmt(iterator: TokenIterator): void {
  const { star, slash, modulo } = TOKENS.ARITHMETICS;
  while ([star, slash, modulo].includes(iterator.peek().type)) {
    iterator.consume(iterator.peek().type); // Consume `*`, `/`, or `%`
    unitaryStmt(iterator);
  }
}
