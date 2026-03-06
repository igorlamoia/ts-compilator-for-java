import type { PrismaClient } from '@prisma/client'
import { ValidationError, ConflictError } from '@/lib/errors'

export async function registerUseCase(
  prisma: PrismaClient,
  input: { name: string; email: string; password: string; role: string },
) {
  const { name, email, password, role } = input

  if (!name || !email || !password || !role) {
    throw new ValidationError('Missing required fields')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('User with this email already exists')
  }

  let org = await prisma.organization.findFirst({ where: { name: 'Default Organization' } })
  if (!org) {
    org = await prisma.organization.create({ data: { name: 'Default Organization' } })
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: role.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT',
      organizationId: org.id,
    },
  })

  return user
}
