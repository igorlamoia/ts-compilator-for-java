import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { optAttributeStmt } from "./optAttributeStmt";
import { optExprStmt } from "./optExprStmt";
import { stmt } from "./stmt";
import { Emitter } from "../../ir/emitter";

/**
 * Parses a `for` loop and emits control flow instructions.
 *
 * @derivation `<forStmt> -> for '(' <optAtrib> ';' <optExpr> ';' <optAtrib> ')' <stmt>`
 */
export function forStmt(iterator: TokenIterator, emitter: Emitter): void {
  const { left_paren, right_paren, semicolon } = TOKENS.SYMBOLS;

  iterator.consume(TOKENS.RESERVEDS.for);
  iterator.consume(left_paren);

  // (1) Init
  optAttributeStmt(iterator, emitter);
  iterator.consume(semicolon);

  const labelStart = emitter.newLabel();
  const labelBody = emitter.newLabel();
  const labelIncrement = emitter.newLabel();
  const labelEnd = emitter.newLabel();

  emitter.emit("LABEL", labelStart, null, null);

  // (2) Cond
  const conditionResult = optExprStmt(iterator, emitter);
  iterator.consume(semicolon);

  if (conditionResult !== null) {
    emitter.emit("IF", conditionResult, labelBody, labelEnd);
  } else {
    emitter.emit("JUMP", labelBody, null, null);
  }

  // (3) Incremento — ANTES de consumir o ')'
  emitter.emit("LABEL", labelIncrement, null, null);
  optAttributeStmt(iterator, emitter);

  iterator.consume(right_paren); // ✅ depois do incremento

  // (4) Corpo
  emitter.emit("LABEL", labelBody, null, null);
  stmt(iterator, emitter);
  emitter.emit("JUMP", labelIncrement, null, null);

  // (5) Fim
  emitter.emit("LABEL", labelEnd, null, null);
}
