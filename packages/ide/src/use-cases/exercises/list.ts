import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function listExercisesUseCase(
  prisma: PrismaClient,
  input: { teacherId: string },
) {
  const { teacherId } = input

  if (!teacherId) throw new ValidationError('teacherId e obrigatorio')

  return prisma.exercise.findMany({
    where: { teacherId },
    include: {
      testCases: { orderBy: { orderIndex: 'asc' } },
    },
  })
}
