import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { listExercisesUseCase } from '@/use-cases/exercises/list'
import { createExerciseUseCase } from '@/use-cases/exercises/create'
import { ValidationError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string || 'default-user-id'

  if (req.method === 'GET') {
    const classId = req.query.classId as string
    try {
      const exercises = await listExercisesUseCase(prisma, { classId, userId })
      return res.status(200).json(exercises)
    } catch (error) {
      if (error instanceof ValidationError) return res.status(400).json({ error: error.message })
      throw error
    }
  }

  if (req.method === 'POST') {
    const exercise = await createExerciseUseCase(prisma, req.body)
    return res.status(201).json(exercise)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
