import { functionCall } from "../../grammar/syntax/function-call";
import { Lexer } from "../../lexer";
import { Instruction } from "../../interpreter/constants";
import { GrammarConfig, TokenIterator } from "../../token/TokenIterator";

type CompileToIrOptions = {
  locale?: string;
  grammar?: GrammarConfig;
};

export function compileToIr(
  source: string,
  options?: CompileToIrOptions,
): Instruction[] {
  const locale = options?.locale ?? "en";
  const lexer = new Lexer(source, { locale });
  const tokens = lexer.scanTokens();
  const iterator = new TokenIterator(tokens, {
    locale,
    grammar: options?.grammar,
  });

  while (iterator.hasNext()) {
    functionCall(iterator);
  }

  return iterator.emitter.getInstructions();
}
