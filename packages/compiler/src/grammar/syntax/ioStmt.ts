import { ScanHint } from "../../interpreter/constants";
import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { argumentListStmt } from "./argumentListStmt";
import { consumeStmtTerminator } from "./statementTerminator";

const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;

/**
 * Parses a print statement: `print(<expr> { ',' <expr> });`
 *
 * @derivation `<printStmt> -> 'print' '(' <argList> ')' ';'`
 */
export function printStmt(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.print);
  iterator.consume(SYMBOLS.left_paren);

  const values = argumentListStmt(iterator);

  for (const val of values) {
    // Heurística simples: se for aspas, é string; se número, também é literal
    if (val.place.startsWith('"') || !isNaN(Number(val.place))) {
      iterator.emitter.emit("CALL", "PRINT", val.place, null);
    } else {
      iterator.emitter.emit("CALL", "PRINT", null, val.place); // identificador
    }
  }

  iterator.consume(SYMBOLS.right_paren);
  consumeStmtTerminator(iterator);
}

/**
 * Parses a scan statement:
 * - typed mode: `scan(<type-or-format>, <ident>);`
 * - untyped mode: `scan(<ident>);`
 *
 * @derivation `<scanStmt> -> 'scan' '(' (<type-or-format> ',' )? 'IDENT' ')' ';'`
 */
export function scanStmt(iterator: TokenIterator): void {
  iterator.consume(RESERVEDS.scan);
  iterator.consume(SYMBOLS.left_paren);

  const typingMode = iterator.getTypingMode();
  let hint: ScanHint = null;
  let ident;

  if (typingMode === "untyped") {
    ident = iterator.consume(LITERALS.identifier);
  } else {
    hint = parseScanHint(iterator);
    iterator.consume(SYMBOLS.comma);
    ident = iterator.consume(LITERALS.identifier);

    if (hint === "float") {
      iterator.warnIfLossyWriteToSymbol(ident.lexeme, "float", ident);
    }
  }

  iterator.consume(SYMBOLS.right_paren);
  consumeStmtTerminator(iterator);

  iterator.emitter.emit("CALL", "SCAN", hint, ident.lexeme);
}

function parseScanHint(iterator: TokenIterator): ScanHint {
  const token = iterator.peek();

  if (
    token.type === RESERVEDS.int ||
    token.type === RESERVEDS.float
  ) {
    return iterator.consume(token.type).lexeme as ScanHint;
  }

  if (token.type === LITERALS.string_literal) {
    const literal = iterator.consume(LITERALS.string_literal).lexeme;
    if (literal === '"%d"') return "int";
    if (literal === '"%f"') return "float";
  }

  iterator.throwError("grammar.unexpected_type", token.line, token.column, {
    lexeme: token.lexeme,
    line: token.line,
    column: token.column,
  });
}
