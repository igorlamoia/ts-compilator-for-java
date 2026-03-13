import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function createExerciseListUseCase(
  prisma: PrismaClient,
  input: { teacherId: string; title: string; description: string },
) {
  const { teacherId, title, description } = input

  if (!title.trim()) throw new ValidationError('title e obrigatorio')

  return prisma.exerciseList.create({
    data: { teacherId, title, description },
    include: { items: { include: { exercise: true } } },
  })
}
