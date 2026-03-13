import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function getExerciseListUseCase(prisma: PrismaClient, id: string) {
  const list = await prisma.exerciseList.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { orderIndex: 'asc' },
        include: { exercise: { include: { testCases: { orderBy: { orderIndex: 'asc' } } } } },
      },
      classes: {
        select: { classId: true, deadline: true, totalGrade: true, minRequired: true, publishedAt: true },
      },
    },
  })

  if (!list) throw new NotFoundError('Lista nao encontrada')
  return list
}
