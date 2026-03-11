import type { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { ValidationError, UnauthorizedError } from '@/lib/errors'

export async function loginUseCase(
  prisma: PrismaClient,
  input: { email: string; password: string },
) {
  const { email, password } = input

  if (!email || !password) {
    throw new ValidationError('Campos obrigatorios nao informados')
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('E-mail ou senha invalidos')
  }

  const passwordMatch = await compare(password, user.password)
  if (!passwordMatch) {
    throw new UnauthorizedError('E-mail ou senha invalidos')
  }

  return user
}
