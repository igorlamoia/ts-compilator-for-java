import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { forStmt } from "./forStmt";
import { blockStmt } from "./blockStmt";
import { attributeStmt } from "./attributeStmt";
import { whileStmt } from "./whileStmt";
import { ifStmt } from "./ifStmt";
import { declarationStmt } from "./declarationStmt";
import { ioStmt } from "./ioStmt";
import { breakStmt } from "./breakStmt";
import { continueStmt } from "./continueStmt";

/**
 * Parses a statement by calling the appropriate function
 * based on the current token.
 *
 * @derivation `<stmt> -> <forStmt> | <ioStmt> | <whileStmt> | <atrib> ';' | <ifStmt> | <bloco> | <declaration> | 'break' | 'continue' | ';'`
 */
export function stmt(iterator: TokenIterator): void {
  const token = iterator.peek();
  const { RESERVEDS } = TOKENS;

  const stmtsFactory = {
    [RESERVEDS.for]: forStmt,
    [RESERVEDS.system]: ioStmt,
    [RESERVEDS.while]: whileStmt,
    [TOKENS.LITERALS.identifier]: attrbuteStmtVariant,
    [RESERVEDS.if]: ifStmt,
    [TOKENS.SYMBOLS.left_brace]: blockStmt,
    [RESERVEDS.int]: declarationStmt,
    [RESERVEDS.float]: declarationStmt,
    [RESERVEDS.string]: declarationStmt,
    [RESERVEDS.break]: breakStmt,
    [RESERVEDS.continue]: continueStmt,
  };

  const goToStmt = stmtsFactory[token.type];
  if (goToStmt) return goToStmt(iterator);

  const ignoreStmts = {
    [TOKENS.SYMBOLS.semicolon]: iterator.consume.bind(iterator),
  };

  const ignoreStmt = ignoreStmts[token.type];
  if (ignoreStmt) {
    ignoreStmt(token.type);
    return;
  }

  throw new Error(`Unexpected statement: ${token.lexeme}`);
}

function attrbuteStmtVariant(iterator: TokenIterator): void {
  attributeStmt(iterator);
  iterator.consume(TOKENS.SYMBOLS.semicolon);
}
