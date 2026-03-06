import type { PrismaClient } from '@prisma/client'

export async function createClassUseCase(
  prisma: PrismaClient,
  input: {
    orgId: string
    userId: string
    name: string
    description: string
    accessCode: string
  },
) {
  const { orgId, userId, name, description, accessCode } = input

  await prisma.organization.upsert({
    where: { id: orgId },
    create: { id: orgId, name: 'Organization' },
    update: {},
  })

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      organizationId: orgId,
      email: `teacher-${userId}@temp.com`,
      name: 'Teacher',
      role: 'TEACHER',
    },
    update: {},
  })

  return prisma.class.create({ data: { organizationId: orgId, teacherId: userId, name, description, accessCode } })
}
