import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSubmissionUseCase } from '@/use-cases/submissions/get'
import { gradeSubmissionUseCase } from '@/use-cases/submissions/grade'
import { HttpError } from '@/lib/errors'
import { toSubmissionDTO } from '@/dtos/submission.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID da submissao e obrigatorio' })

  if (req.method === 'GET') {
    try {
      const submission = await getSubmissionUseCase(prisma, id)
      return res.status(200).json(toSubmissionDTO(submission))
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  if (req.method === 'PATCH') {
    const { score, teacherFeedback } = req.body
    const submission = await gradeSubmissionUseCase(prisma, { id, score, teacherFeedback })
    return res.status(200).json(toSubmissionDTO(submission))
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
