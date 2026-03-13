import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { addExerciseToListUseCase } from '@/use-cases/exercise-lists/add-exercise'
import { removeExerciseFromListUseCase } from '@/use-cases/exercise-lists/remove-exercise'
import { HttpError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  const { id: exerciseListId } = req.query as { id: string }
  if (!exerciseListId || typeof exerciseListId !== 'string') return res.status(400).json({ error: 'Id invalido' })

  if (req.method === 'POST') {
    try {
      const { exerciseId, gradeWeight, orderIndex } = req.body
      if (!exerciseId) return res.status(400).json({ error: 'exerciseId e obrigatorio' })
      if (!gradeWeight || isNaN(Number(gradeWeight))) return res.status(400).json({ error: 'gradeWeight invalido' })
      const item = await addExerciseToListUseCase(prisma, { exerciseListId, exerciseId, gradeWeight: Number(gradeWeight), orderIndex })
      return res.status(201).json(item)
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { exerciseId } = req.query as { exerciseId?: string }
      if (!exerciseId) return res.status(400).json({ error: 'exerciseId e obrigatorio' })
      await removeExerciseFromListUseCase(prisma, { exerciseListId, exerciseId })
      return res.status(204).end()
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
