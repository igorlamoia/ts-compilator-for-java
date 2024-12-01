import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { forStmt } from "./forStmt";
import { blockStmt } from "./blockStmt";
import { attributeStmt } from "./attributeStmt";
import { whileStmt } from "./whileStmt";
import { ifStmt } from "./ifStmt";
import { declarationStmt } from "./declarationStmt";
import { ioStmt } from "./ioStmt";

// <stmt> -> <forStmt> | <ioStmt> | <whileStmt> | <atrib> ';' | <ifStmt> | <bloco> | 'break' | 'continue' | <declaration> | ';' ;
export function stmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  const { RESERVEDS } = TOKENS;

  const stmtsFactory = {
    [RESERVEDS.for]: forStmt,
    [RESERVEDS.while]: whileStmt,
    [RESERVEDS.if]: ifStmt,
    [RESERVEDS.int]: declarationStmt,
    [RESERVEDS.float]: declarationStmt,
    [RESERVEDS.string]: declarationStmt,
    [RESERVEDS.system]: ioStmt, // Add ioStmt here
    [TOKENS.SYMBOLS.left_brace]: blockStmt,
    [TOKENS.LITERALS.identifier]: attributeStmt,
  };

  const goToStmt = stmtsFactory[token.type];
  if (goToStmt) return goToStmt(iterator);

  const ignoreStmts = {
    [RESERVEDS.break]: iterator.next,
    [RESERVEDS.continue]: iterator.next,
    [TOKENS.SYMBOLS.semicolon]: iterator.next,
  };

  const ignoreStmt = ignoreStmts[token.type];
  if (ignoreStmt) {
    ignoreStmt();
    return;
  }

  throw new Error(`Unexpected statement: ${token.lexeme}`);
}
