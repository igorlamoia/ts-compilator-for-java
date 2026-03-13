import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function listExerciseListsUseCase(
  prisma: PrismaClient,
  input: { teacherId: string },
) {
  if (!input.teacherId) throw new ValidationError('teacherId e obrigatorio')

  return prisma.exerciseList.findMany({
    where: { teacherId: input.teacherId },
    include: {
      items: {
        orderBy: { orderIndex: 'asc' },
        include: { exercise: { select: { id: true, title: true, status: true } } },
      },
      classes: {
        select: { classId: true, deadline: true, totalGrade: true, minRequired: true, publishedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
