import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { listExercisesUseCase } from '@/use-cases/exercises/list'
import { createExerciseUseCase } from '@/use-cases/exercises/create'
import { HttpError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  if (req.method === 'GET') {
    try {
      const exercises = await listExercisesUseCase(prisma, { teacherId: userId })
      return res.status(200).json(exercises)
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, testCases } = req.body
      const exercise = await createExerciseUseCase(prisma, { teacherId: userId, title, description, testCases })
      return res.status(201).json(exercise)
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
