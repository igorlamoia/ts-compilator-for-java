import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function joinClassUseCase(
  prisma: PrismaClient,
  input: { userId: string; accessCode: string },
) {
  const { userId, accessCode } = input

  const cls = await prisma.class.findUnique({ where: { accessCode } })
  if (!cls) throw new NotFoundError('Class not found')

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      organizationId: cls.organizationId,
      email: `student-${userId}@temp.com`,
      name: 'Student',
      role: 'STUDENT',
    },
    update: {},
  })

  await prisma.classMember.upsert({
    where: { classId_studentId: { classId: cls.id, studentId: userId } },
    create: { classId: cls.id, studentId: userId },
    update: {},
  })

  return { classId: cls.id }
}
