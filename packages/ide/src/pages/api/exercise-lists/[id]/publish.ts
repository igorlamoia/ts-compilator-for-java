import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { publishExerciseListUseCase } from '@/use-cases/exercise-lists/publish'
import { HttpError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  const { id: exerciseListId } = req.query as { id: string }
  if (!exerciseListId || typeof exerciseListId !== 'string') return res.status(400).json({ error: 'Id invalido' })

  if (req.method === 'POST') {
    try {
      const { classId, deadline, totalGrade, minRequired } = req.body
      if (!classId) return res.status(400).json({ error: 'classId e obrigatorio' })
      if (!deadline) return res.status(400).json({ error: 'deadline e obrigatorio' })

      const publication = await publishExerciseListUseCase(prisma, {
        exerciseListId,
        classId,
        deadline: new Date(deadline),
        totalGrade: Number(totalGrade),
        minRequired: Number(minRequired),
      })
      return res.status(200).json(publication)
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
