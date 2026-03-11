import type { PrismaClient } from '@prisma/client'
import { ValidationError } from '@/lib/errors'

export async function listSubmissionsUseCase(prisma: PrismaClient, exerciseId: string) {
  if (!exerciseId) throw new ValidationError('Missing exerciseId')
  return prisma.submission.findMany({ where: { exerciseId }, include: { student: true } })
}
