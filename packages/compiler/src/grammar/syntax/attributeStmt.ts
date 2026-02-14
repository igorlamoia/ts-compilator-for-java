import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { IssueError } from "../../issue";
import { exprStmt } from "./exprStmt";
/**
 * Processes an attribute statement by first parsing an identifier token,
 *  and then call the expression statement.
 *
 * @derivation `<atrib> -> 'IDENT' '=' <expr> | 'IDENT' '+=' <expr> | 'IDENT' '-=' <expr> | 'IDENT' '\*=' <expr> | 'IDENT' '/=' <expr> | 'IDENT' '%=' <expr>`
 */
export function attributeStmt(iterator: TokenIterator): void {
  const token = iterator.consume(TOKENS.LITERALS.identifier);
  if (!Object.values(TOKENS.ASSIGNMENTS).includes(iterator.peek().type))
    throw new IssueError(
      `Invalid assignment operator "${token.lexeme}" at line ${token.line}, column ${token.column}.`,
      token.line,
      token.column
    );
  iterator.consume(iterator.peek().type);
  const value = exprStmt(iterator);
  iterator.emitter.emit("=", token.lexeme, value, null);
}
