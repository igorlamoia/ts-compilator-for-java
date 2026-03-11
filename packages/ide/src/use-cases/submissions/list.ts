import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function listSubmissionsUseCase(prisma: PrismaClient, exerciseId: string) {
  if (!exerciseId) throw new ValidationError('exerciseId e obrigatorio')
  return prisma.submission.findMany({ where: { exerciseId }, include: { student: true } })
}
