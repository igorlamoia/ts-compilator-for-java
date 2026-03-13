import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function createSubmissionUseCase(
  prisma: PrismaClient,
  input: {
    exerciseId: string
    studentId: string
    exerciseListId: string
    classId: string
    codeSnapshot: string
    status?: string
  },
) {
  const { exerciseId, studentId, exerciseListId, classId, codeSnapshot, status } = input

  // Verify the exercise belongs to the list
  const listItem = await prisma.exerciseListItem.findUnique({
    where: { exerciseListId_exerciseId: { exerciseListId, exerciseId } },
  })
  if (!listItem) throw new ValidationError('Exercicio nao pertence a esta lista')

  return prisma.submission.create({
    data: {
      exerciseId,
      studentId,
      exerciseListId,
      classId,
      codeSnapshot,
      status: (status as any) || 'PENDING',
    },
  })
}
