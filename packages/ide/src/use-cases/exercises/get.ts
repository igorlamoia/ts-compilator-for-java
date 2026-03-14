import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function getExerciseUseCase(
  prisma: PrismaClient,
  input: { id: string; userId: string },
) {
  const { id, userId } = input

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: {
      class: { select: { name: true, teacherId: true } },
      submissions: {
        where: { studentId: userId },
        orderBy: { submittedAt: 'desc' },
        take: 1,
      },
      testCases: { orderBy: { orderIndex: 'asc' } },
    },
  })

  if (!exercise) throw new NotFoundError('Exercicio nao encontrado')

  const isTeacher = exercise.class.teacherId === userId

  if (!isTeacher && exercise.testCases) {
    exercise.testCases = exercise.testCases.map((tc) => ({ ...tc, expectedOutput: '' }))
  }

  return exercise
}
