import type { PrismaClient } from '@prisma/client'

export async function listOrganizationsUseCase(prisma: PrismaClient) {
  return prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
