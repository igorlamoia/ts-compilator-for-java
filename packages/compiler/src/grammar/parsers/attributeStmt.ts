import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";

export function attributeStmt(iterator: TokenIterator): void {
  const token = iterator.consume(TOKENS.LITERALS.identifier);
  const validAssignments = ["=", "+=", "-=", "*=", "/=", "%="];
  if (!validAssignments.includes(token.lexeme)) {
    throw new Error(
      `Invalid assignment operator "${token.lexeme}" at line ${token.line}, column ${token.column}.`
    );
  }
  exprStmt(iterator);
}
