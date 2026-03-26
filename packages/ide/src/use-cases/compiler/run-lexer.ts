import { Lexer } from '@ts-compilator-for-java/compiler/src/lexer'
import type { KeywordMap } from '@ts-compilator-for-java/compiler/src/lexer'
import { buildEffectiveKeywordMap } from '@/lib/keyword-map'

export function runLexerUseCase(input: {
  sourceCode: string
  keywordMap?: KeywordMap
  operatorWordMap?: import('@ts-compilator-for-java/compiler/src/lexer/config').OperatorWordMap
  booleanLiteralMap?: import('@ts-compilator-for-java/compiler/src/lexer/config').BooleanLiteralMap
  blockDelimiters?: import('@ts-compilator-for-java/compiler/src/lexer/config').LexerBlockDelimiters
  indentationBlock?: boolean
  statementTerminatorLexeme?: string
  locale?: string
}) {
  const {
    sourceCode,
    keywordMap,
    operatorWordMap,
    booleanLiteralMap,
    blockDelimiters,
    indentationBlock,
    statementTerminatorLexeme,
    locale,
  } = input
  const effectiveKeywordMap = buildEffectiveKeywordMap(keywordMap)
  const lexer = new Lexer(sourceCode, {
    customKeywords: effectiveKeywordMap,
    operatorWordMap,
    booleanLiteralMap,
    statementTerminatorLexeme,
    blockDelimiters,
    indentationBlock,
    locale,
  })
  const tokens = lexer.scanTokens()
  return { tokens, warnings: lexer.warnings, infos: lexer.infos }
}
