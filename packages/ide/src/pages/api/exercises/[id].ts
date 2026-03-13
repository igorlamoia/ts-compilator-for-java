import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getExerciseUseCase } from '@/use-cases/exercises/get'
import { HttpError } from '@/lib/errors'
import { toExerciseDTO } from '@/dtos/exercise.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID do exercicio e obrigatorio' })

  if (req.method === 'GET') {
    try {
      const exercise = await getExerciseUseCase(prisma, id)
      return res.status(200).json(toExerciseDTO(exercise))
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
