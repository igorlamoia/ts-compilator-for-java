import type { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'

export async function registerUseCase(
  prisma: PrismaClient,
  input: { name: string; email: string; password: string; role: string; organizationId: string },
) {
  const { name, email, password, role, organizationId } = input

  if (!name || !email || !password || !role || !organizationId) {
    throw new ValidationError('Campos obrigatorios nao informados')
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) {
    throw new NotFoundError('Organizacao nao encontrada')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('Ja existe um usuario com este e-mail')
  }

  const hashedPassword = await hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT',
      organizationId,
    },
  })

  return user
}
