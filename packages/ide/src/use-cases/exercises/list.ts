import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function listExercisesUseCase(
  prisma: PrismaClient,
  input: { classId: string; userId: string },
) {
  const { classId, userId } = input

  if (!classId) throw new ValidationError('Missing classId')

  return prisma.exercise.findMany({
    where: { classId },
    include: {
      submissions: {
        where: { studentId: userId },
        orderBy: { submittedAt: 'desc' },
        take: 1,
        select: { id: true, status: true, score: true, teacherFeedback: true, submittedAt: true },
      },
      testCases: { orderBy: { orderIndex: 'asc' } },
    },
  })
}
