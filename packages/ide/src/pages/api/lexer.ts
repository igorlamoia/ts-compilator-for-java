import type { NextApiRequest, NextApiResponse } from 'next'
import type { KeywordMap } from '@ts-compilator-for-java/compiler/src/lexer'
import { IssueError } from '@ts-compilator-for-java/compiler/issue'
import type { IssueDetails } from '@ts-compilator-for-java/compiler/issue'
import { runLexerUseCase } from '@/use-cases/compiler/run-lexer'
import { TToken } from '@/@types/token'

export type TLexerAnalyseData = {
  tokens: TToken[]
  warnings: IssueDetails[]
  infos: IssueDetails[]
  error: IssueDetails | null
  message?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<TLexerAnalyseData>) {
  try {
    const { sourceCode, keywordMap, locale } = req.body as {
      sourceCode: string
      keywordMap?: KeywordMap
      locale?: string
    }
    const { tokens, warnings, infos } = runLexerUseCase({ sourceCode, keywordMap, locale })
    res.status(200).json({
      message: 'Lexical Analysis completed' + (warnings.length ? ' with warnings' : ''),
      tokens,
      warnings,
      infos,
      error: null,
    })
  } catch (error) {
    if (!(error instanceof IssueError)) {
      return res.status(500).json({
        tokens: [],
        warnings: [],
        infos: [],
        error: null,
        message: (error as Error).message || 'Code not supported',
      })
    }
    res.status(400).json({ message: error.message, tokens: [], warnings: [], infos: [], error: error.details })
  }
}
