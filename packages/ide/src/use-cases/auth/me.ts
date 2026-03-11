import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function getMeUseCase(prisma: PrismaClient, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('Usuario nao encontrado')
  return user
}
