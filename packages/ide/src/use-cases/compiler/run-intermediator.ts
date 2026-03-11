import { TokenIterator } from '@ts-compilator-for-java/compiler/token/TokenIterator'
import type { Token } from '@ts-compilator-for-java/compiler/token'

export function runIntermediatorUseCase(input: { tokens: Token[]; locale?: string }) {
  const { tokens, locale } = input
  const iterator = new TokenIterator(tokens, locale)
  return iterator.generateIntermediateCode()
}
