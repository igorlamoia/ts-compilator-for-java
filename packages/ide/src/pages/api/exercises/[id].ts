import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getExerciseUseCase } from '@/use-cases/exercises/get'
import { NotFoundError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing exercise id' })

  if (req.method === 'GET') {
    try {
      const exercise = await getExerciseUseCase(prisma, { id, userId })
      return res.status(200).json(exercise)
    } catch (error) {
      if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
