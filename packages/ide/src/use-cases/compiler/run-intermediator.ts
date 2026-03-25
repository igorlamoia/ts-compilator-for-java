import { TokenIterator } from '@ts-compilator-for-java/compiler/token/TokenIterator'
import type { Token } from '@ts-compilator-for-java/compiler/token'
import type { IDEGrammarConfig, IDEOperatorWordMap } from '@/entities/compiler-config'

export function runIntermediatorUseCase(input: {
  tokens: Token[]
  locale?: string
  grammar?: IDEGrammarConfig
  operatorWordMap?: IDEOperatorWordMap
  statementTerminatorLexeme?: string
}) {
  const { tokens, locale, grammar, operatorWordMap, statementTerminatorLexeme } = input
  const iterator = new TokenIterator(tokens, {
    locale,
    grammar,
    operatorWordMap,
    statementTerminatorLexeme,
  })
  return iterator.generateIntermediateCode()
}
