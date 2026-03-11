import type { PrismaClient } from '@prisma/client'

export async function createSubmissionUseCase(
  prisma: PrismaClient,
  input: { exerciseId: string; studentId: string; codeSnapshot: string; status?: string },
) {
  const { exerciseId, studentId, codeSnapshot, status } = input

  return prisma.submission.create({
    data: {
      exerciseId,
      studentId,
      codeSnapshot,
      status: (status as any) || 'PENDING',
    },
  })
}
