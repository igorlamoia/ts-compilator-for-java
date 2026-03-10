import type { PrismaClient } from '@prisma/client'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'

export async function registerUseCase(
  prisma: PrismaClient,
  input: { name: string; email: string; password: string; role: string; organizationId: string },
) {
  const { name, email, password, role, organizationId } = input

  if (!name || !email || !password || !role || !organizationId) {
    throw new ValidationError('Missing required fields')
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) {
    throw new NotFoundError('organization_not_found', {params: })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('User with this email already exists')
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: role.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT',
      organizationId,
    },
  })

  return user
}
