import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function addExerciseToListUseCase(
  prisma: PrismaClient,
  input: { exerciseListId: string; exerciseId: string; gradeWeight: number; orderIndex?: number },
) {
  const { exerciseListId, exerciseId, gradeWeight, orderIndex = 0 } = input

  if (gradeWeight <= 0) throw new ValidationError('gradeWeight deve ser maior que zero')

  return prisma.exerciseListItem.create({
    data: { exerciseListId, exerciseId, gradeWeight, orderIndex },
  })
}
