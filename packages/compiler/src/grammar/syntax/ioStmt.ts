import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outListStmt } from "./outListStmt";
import { typeStmt } from "./typeStmt";

const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;

/**
 * Parses a print statement: `print(<outList>);`
 *
 * @derivation `<printStmt> -> 'print' '(' <outList> ')' ';'`
 */
export function printStmt(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.print);
  iterator.consume(SYMBOLS.left_paren);

  const values = outListStmt(iterator); // retorna string[]

  for (const val of values) {
    // Heurística simples: se for aspas, é string; se número, também é literal
    if (val.startsWith('"') || !isNaN(Number(val))) {
      iterator.emitter.emit("CALL", "PRINT", val, null);
    } else {
      iterator.emitter.emit("CALL", "PRINT", null, val); // identificador
    }
  }

  iterator.consume(SYMBOLS.right_paren);
  iterator.consume(SYMBOLS.semicolon);
}

/**
 * Parses a scan statement: `scan(<type>, <ident>);`
 *
 * @derivation `<scanStmt> -> 'scan' '(' <type> ',' 'IDENT' ')' ';'`
 */
export function scanStmt(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.scan);
  iterator.consume(SYMBOLS.left_paren);

  typeStmt(iterator); // tipo — não utilizado agora, mas pode ser futuramente
  iterator.consume(SYMBOLS.comma);

  const ident = iterator.consume(LITERALS.identifier);
  iterator.consume(SYMBOLS.right_paren);
  iterator.consume(SYMBOLS.semicolon);

  // Gera instrução de leitura
  iterator.emitter.emit("CALL", "SCAN", null, ident.lexeme);
}
