import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outListStmt } from "./outListStmt";
import { typeStmt } from "./typeSmt";

const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;
// <ioStmt> -> 'system' '.' 'in' '.' 'scan' '(' <type> ',' 'IDENT' ')' ';'
//           | 'system' '.' 'out' '.' 'print' '(' <outList> ')' ';' ;
export function ioStmt(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.system);
  iterator.consume(SYMBOLS.dot);
  const systems = {
    [TOKENS.RESERVEDS.in]: systemInScan,
    [TOKENS.RESERVEDS.out]: systemOutPrint,
  };
  const systemRun = systems[iterator.peek().type];
  if (!systemRun)
    throw new Error(`Invalid I/O operation: ${iterator.peek().lexeme}`);
  systemRun(iterator);
}

function systemInScan(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.in);
  iterator.consume(SYMBOLS.dot);
  iterator.consume(RESERVEDS.scan);
  iterator.consume(SYMBOLS.left_paren);
  typeStmt(iterator);
  iterator.consume(SYMBOLS.comma);
  iterator.consume(LITERALS.identifier);
  iterator.consume(SYMBOLS.right_paren);
  iterator.consume(SYMBOLS.semicolon);
}

function systemOutPrint(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.out);
  iterator.consume(SYMBOLS.dot);
  iterator.consume(RESERVEDS.print);
  iterator.consume(SYMBOLS.left_paren);
  outListStmt(iterator);
  iterator.consume(SYMBOLS.right_paren);
  iterator.consume(SYMBOLS.semicolon);
}
