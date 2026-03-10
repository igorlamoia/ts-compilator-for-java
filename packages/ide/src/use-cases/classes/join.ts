import type { PrismaClient } from '@prisma/client'
import { NotFoundError, ForbiddenError } from '@/lib/errors'

export async function joinClassUseCase(
  prisma: PrismaClient,
  input: { userId: string; accessCode: string },
) {
  const { userId, accessCode } = input

  const cls = await prisma.class.findUnique({ where: { accessCode } })
  if (!cls) throw new NotFoundError('Class not found')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('User not found')

  if (user.organizationId !== cls.organizationId) {
    throw new ForbiddenError('User does not belong to this class organization')
  }

  await prisma.classMember.upsert({
    where: { classId_studentId: { classId: cls.id, studentId: userId } },
    create: { classId: cls.id, studentId: userId },
    update: {},
  })

  return { classId: cls.id }
}
