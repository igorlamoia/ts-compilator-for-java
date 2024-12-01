import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outListStmt } from "./outListStmt";
import { typeStmt } from "./typeSmt";

// <ioStmt> -> 'system' '.' 'in' '.' 'scan' '(' <type> ',' 'IDENT' ')' ';'
//           | 'system' '.' 'out' '.' 'print' '(' <outList> ')' ';'
export function ioStmt(iterator: TokenIterator): void {
  const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;

  iterator.consume(RESERVEDS.system); // 'system'
  iterator.consume(SYMBOLS.dot); // '.'

  const nextToken = iterator.peek();
  if (nextToken.lexeme === "in") {
    // 'system.in.scan'
    iterator.consume(RESERVEDS.in); // 'in'
    iterator.consume(SYMBOLS.dot); // '.'
    iterator.consume(RESERVEDS.scan); // 'scan'
    iterator.consume(SYMBOLS.left_paren); // '('
    typeStmt(iterator); // <type>
    iterator.consume(SYMBOLS.comma); // ','
    iterator.consume(LITERALS.identifier); // 'IDENT'
    iterator.consume(SYMBOLS.right_paren); // ')'
    iterator.consume(SYMBOLS.semicolon); // ';'
  } else if (nextToken.lexeme === "out") {
    // 'system.out.print'
    iterator.consume(RESERVEDS.out); // 'out'
    iterator.consume(SYMBOLS.dot); // '.'
    iterator.consume(RESERVEDS.print); // 'print'
    iterator.consume(SYMBOLS.left_paren); // '('
    outListStmt(iterator); // <outList>
    iterator.consume(SYMBOLS.right_paren); // ')'
    iterator.consume(SYMBOLS.semicolon); // ';'
  } else {
    throw new Error(`Unconsumeed I/O operation: ${nextToken.lexeme}`);
  }
}
