import { Lexer } from '@ts-compilator-for-java/compiler/src/lexer'
import type { KeywordMap } from '@ts-compilator-for-java/compiler/src/lexer'
import { buildEffectiveKeywordMap } from '@/lib/keyword-map'

export function runLexerUseCase(input: {
  sourceCode: string
  keywordMap?: KeywordMap
  locale?: string
}) {
  const { sourceCode, keywordMap, locale } = input
  const effectiveKeywordMap = buildEffectiveKeywordMap(keywordMap)
  const lexer = new Lexer(sourceCode, effectiveKeywordMap, locale)
  const tokens = lexer.scanTokens()
  return { tokens, warnings: lexer.warnings, infos: lexer.infos }
}
