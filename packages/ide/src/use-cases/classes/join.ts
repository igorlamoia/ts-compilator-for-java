import type { PrismaClient } from '@prisma/client'
import { NotFoundError, ForbiddenError } from '@/lib/errors'

export async function joinClassUseCase(
  prisma: PrismaClient,
  input: { userId: string; accessCode: string },
) {
  const { userId, accessCode } = input

  const cls = await prisma.class.findUnique({ where: { accessCode } })
  if (!cls) throw new NotFoundError('Turma nao encontrada')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new NotFoundError('Usuario nao encontrado')

  if (user.organizationId !== cls.organizationId) {
    throw new ForbiddenError('Usuario nao pertence a organizacao desta turma')
  }

  await prisma.classMember.upsert({
    where: { classId_studentId: { classId: cls.id, studentId: userId } },
    create: { classId: cls.id, studentId: userId },
    update: {},
  })

  return { classId: cls.id }
}
