import type { PrismaClient } from '@prisma/client'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors'

export async function publishExerciseListUseCase(
  prisma: PrismaClient,
  input: {
    exerciseListId: string
    classId: string
    callerId: string
    totalGrade: number
    minRequired: number
    deadline: Date
  },
) {
  const { exerciseListId, classId, callerId, totalGrade, minRequired, deadline } = input

  if (minRequired < 1) throw new ValidationError('minRequired deve ser pelo menos 1')
  if (totalGrade <= 0) throw new ValidationError('totalGrade deve ser maior que zero')

  const list = await prisma.exerciseList.findUnique({ where: { id: exerciseListId } })
  if (!list) throw new NotFoundError('Lista nao encontrada')
  if (list.teacherId !== callerId) throw new ForbiddenError('Acesso negado')

  return prisma.classExerciseList.upsert({
    where: { exerciseListId_classId: { exerciseListId, classId } },
    update: { totalGrade, minRequired, deadline },
    create: { exerciseListId, classId, totalGrade, minRequired, deadline },
  })
}
