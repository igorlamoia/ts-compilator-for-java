import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createSubmissionUseCase } from '@/use-cases/submissions/create'
import { listSubmissionsUseCase } from '@/use-cases/submissions/list'
import { HttpError } from '@/lib/errors'
import { toSubmissionDTO } from '@/dtos/submission.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string || 'default-user-id'

  if (req.method === 'POST') {
    const { exerciseId, codeSnapshot, status } = req.body
    const submission = await createSubmissionUseCase(prisma, { exerciseId, studentId: userId, codeSnapshot, status })
    return res.status(201).json(toSubmissionDTO(submission))
  }

  if (req.method === 'GET') {
    const exerciseId = req.query.exerciseId as string
    try {
      const submissions = await listSubmissionsUseCase(prisma, exerciseId)
      return res.status(200).json(submissions.map(toSubmissionDTO))
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
