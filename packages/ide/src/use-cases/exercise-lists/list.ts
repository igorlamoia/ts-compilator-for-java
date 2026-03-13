import type { PrismaClient } from '@prisma/client'

export async function listExerciseListsUseCase(
  prisma: PrismaClient,
  input: { teacherId: string },
) {
  return prisma.exerciseList.findMany({
    where: { teacherId: input.teacherId },
    include: {
      items: {
        orderBy: { orderIndex: 'asc' },
        include: { exercise: { select: { id: true, title: true, status: true } } },
      },
      classes: {
        select: { classId: true, deadline: true, totalGrade: true, minRequired: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
