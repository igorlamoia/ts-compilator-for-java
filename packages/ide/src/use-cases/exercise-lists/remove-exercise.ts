import type { PrismaClient } from '@prisma/client'

export async function removeExerciseFromListUseCase(
  prisma: PrismaClient,
  input: { exerciseListId: string; exerciseId: string },
) {
  return prisma.exerciseListItem.delete({
    where: { exerciseListId_exerciseId: input },
  })
}
