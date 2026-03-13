import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function removeExerciseFromListUseCase(
  prisma: PrismaClient,
  input: { exerciseListId: string; exerciseId: string },
) {
  try {
    return await prisma.exerciseListItem.delete({
      where: { exerciseListId_exerciseId: input },
    })
  } catch (error: any) {
    if (error?.code === 'P2025') throw new NotFoundError('Item nao encontrado na lista')
    throw error
  }
}
