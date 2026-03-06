import type { PrismaClient } from '@prisma/client'

export async function gradeSubmissionUseCase(
  prisma: PrismaClient,
  input: { id: string; score?: number; teacherFeedback?: string },
) {
  const { id, score, teacherFeedback } = input

  return prisma.submission.update({
    where: { id },
    data: {
      score: score !== undefined ? Number(score) : undefined,
      teacherFeedback: teacherFeedback || undefined,
      status: 'GRADED',
    },
  })
}
