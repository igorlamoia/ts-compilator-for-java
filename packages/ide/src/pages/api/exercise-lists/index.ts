import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { listExerciseListsUseCase } from '@/use-cases/exercise-lists/list'
import { createExerciseListUseCase } from '@/use-cases/exercise-lists/create'
import { HttpError } from '@/lib/errors'
import { toExerciseListDTO } from '@/dtos/exercise-list.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  if (req.method === 'GET') {
    try {
      const lists = await listExerciseListsUseCase(prisma, { teacherId: userId })
      return res.status(200).json(lists.map(toExerciseListDTO))
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description } = req.body
      if (!title) return res.status(400).json({ error: 'title e obrigatorio' })
      const list = await createExerciseListUseCase(prisma, { teacherId: userId, title, description })
      return res.status(201).json(toExerciseListDTO(list))
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
