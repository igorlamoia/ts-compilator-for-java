import type { NextApiRequest, NextApiResponse } from 'next'
import { IssueError } from '@ts-compilator-for-java/compiler/issue'
import type { IssueDetails } from '@ts-compilator-for-java/compiler/issue'
import type { Token } from '@ts-compilator-for-java/compiler/token'
import type { Instruction } from '@ts-compilator-for-java/compiler/interpreter/constants'
import { runIntermediatorUseCase } from '@/use-cases/compiler/run-intermediator'

export type TIntermediateCodeData = {
  instructions: Instruction[]
  warnings: IssueDetails[]
  infos: IssueDetails[]
  error: IssueDetails | null
  message?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<TIntermediateCodeData>) {
  try {
    const { tokens, locale } = req.body as { tokens: Token[]; locale?: string }
    const instructions = runIntermediatorUseCase({ tokens, locale })
    res.status(200).json({
      instructions,
      warnings: [],
      infos: [],
      error: null,
      message: 'Intermediate code generation completed',
    })
  } catch (error) {
    if (!(error instanceof IssueError)) {
      return res.status(500).json({
        instructions: [],
        warnings: [],
        infos: [],
        error: null,
        message: (error as Error).message || 'Code not supported',
      })
    }
    res.status(400).json({ message: error.message, instructions: [], warnings: [], infos: [], error: error.details })
  }
}
