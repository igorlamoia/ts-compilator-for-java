import type { PrismaClient } from '@prisma/client'

export async function listClassesUseCase(prisma: PrismaClient, orgId: string) {
  return prisma.class.findMany({
    where: { organizationId: orgId },
    include: { teacher: true, _count: { select: { members: true, exercises: true } } },
  })
}
