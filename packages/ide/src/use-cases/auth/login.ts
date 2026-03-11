import type { PrismaClient } from '@prisma/client'
import { ValidationError, UnauthorizedError } from '@/lib/errors'

export async function loginUseCase(
  prisma: PrismaClient,
  input: { email: string; password: string },
) {
  const { email, password } = input

  if (!email || !password) {
    throw new ValidationError('Missing required fields')
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('Invalid email or password')
  }

  return user
}
