import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getExerciseListUseCase } from '@/use-cases/exercise-lists/get'
import { HttpError } from '@/lib/errors'
import { toExerciseListDTO } from '@/dtos/exercise-list.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  const { id } = req.query as { id: string }
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Id invalido' })

  if (req.method === 'GET') {
    try {
      const { classId } = req.query as { classId?: string }
      const list = await getExerciseListUseCase(prisma, id)

      let submittedExerciseIds: string[] | undefined
      if (classId && userId) {
        const submissions = await prisma.submission.findMany({
          where: { exerciseListId: id, classId, studentId: userId },
          select: { exerciseId: true },
        })
        submittedExerciseIds = submissions.map((s) => s.exerciseId)
      }

      return res.status(200).json(toExerciseListDTO(list, submittedExerciseIds))
    } catch (error) {
      if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
      throw error
    }
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
