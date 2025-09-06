import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { outListStmt } from "./outListStmt";
import { typeStmt } from "./typeStmt";

const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;

/**
 * Parses the I/O statement: either `system.out.print(...)` or `system.in.scan(...)`.
 *
 * @derivation `<ioStmt> -> ...`
 */
export function ioStmt(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.system);
  iterator.consume(SYMBOLS.dot);

  const systems = {
    [TOKENS.RESERVEDS.in]: systemInScan,
    [TOKENS.RESERVEDS.out]: systemOutPrint,
  };

  const systemRun = systems[iterator.peek().type];
  if (!systemRun) {
    throw new Error(`Invalid I/O operation: ${iterator.peek().lexeme}`);
  }

  systemRun(iterator);
}

function systemInScan(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.in);
  iterator.consume(SYMBOLS.dot);
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

function systemOutPrint(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.out);
  iterator.consume(SYMBOLS.dot);
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
