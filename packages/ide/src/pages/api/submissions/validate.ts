import type { NextApiRequest, NextApiResponse } from 'next'
import type { KeywordMap } from '@ts-compilator-for-java/compiler/src/lexer'
import prisma from '@/lib/prisma'
import { validateSubmissionUseCase, type ValidationResult } from '@/use-cases/compiler/validate-submission'

export type { ValidationResult as TValidationResult }

export default async function handler(req: NextApiRequest, res: NextApiResponse<ValidationResult>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, errors: ['Method not allowed'], warnings: [] })
  }

  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ valid: false, errors: ['Não autorizado'], warnings: [] })

  const { exerciseId, sourceCode, keywordMap } = req.body as {
    exerciseId: string
    sourceCode: string
    keywordMap?: KeywordMap
  }

  if (!exerciseId || !sourceCode) {
    return res.status(400).json({ valid: false, errors: ['Código e exercício são obrigatórios'], warnings: [] })
  }

  try {
    const result = await validateSubmissionUseCase(prisma, {
      exerciseId,
      sourceCode,
      userId,
      keywordMap,
      dryRun: req.query.dryRun === 'true',
    })
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ valid: false, errors: ['Erro ao salvar a submissão no banco de dados'], warnings: [] })
  }
}
