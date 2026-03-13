import type { PrismaClient } from '@prisma/client'

export async function listExerciseListsForClassUseCase(
  prisma: PrismaClient,
  input: { classId: string; studentId: string },
) {
  const { classId, studentId } = input

  return prisma.classExerciseList.findMany({
    where: { classId },
    include: {
      exerciseList: {
        include: {
          items: {
            orderBy: { orderIndex: 'asc' },
            include: {
              exercise: {
                include: {
                  testCases: { orderBy: { orderIndex: 'asc' } },
                  submissions: {
                    where: { studentId, classId },
                    orderBy: { submittedAt: 'desc' },
                    take: 1,
                    select: { id: true, status: true, score: true, submittedAt: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { deadline: 'asc' },
  })
}
