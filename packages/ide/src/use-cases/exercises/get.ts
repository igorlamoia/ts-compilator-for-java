import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function getExerciseUseCase(prisma: PrismaClient, id: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: {
      testCases: { orderBy: { orderIndex: 'asc' } },
    },
  })

  if (!exercise) throw new NotFoundError('Exercicio nao encontrado')
  return exercise
}
