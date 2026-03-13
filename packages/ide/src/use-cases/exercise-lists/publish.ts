import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function publishExerciseListUseCase(
  prisma: PrismaClient,
  input: {
    exerciseListId: string
    classId: string
    deadline: Date
    totalGrade: number
    minRequired: number
  },
) {
  const { exerciseListId, classId, deadline, totalGrade, minRequired } = input

  if (minRequired < 1) throw new ValidationError('minRequired deve ser pelo menos 1')
  if (totalGrade <= 0) throw new ValidationError('totalGrade deve ser maior que zero')

  return prisma.classExerciseList.upsert({
    where: { exerciseListId_classId: { exerciseListId, classId } },
    update: { deadline, totalGrade, minRequired },
    create: { exerciseListId, classId, deadline, totalGrade, minRequired },
  })
}
