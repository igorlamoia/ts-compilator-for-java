import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser } from '../helpers'
import { loginUseCase } from '@/use-cases/auth/login'
import { ValidationError, UnauthorizedError } from '@/lib/errors'

describe('loginUseCase', () => {
  it('should return user when email exists', async () => {
    const org = await createOrg()
    const user = await createUser(org.id, { email: 'login@test.com' })

    const result = await loginUseCase(prisma, { email: 'login@test.com', password: 'any' })

    expect(result.id).toBe(user.id)
    expect(result.email).toBe('login@test.com')
  })

  it('should throw ValidationError when email is missing', async () => {
    await expect(loginUseCase(prisma, { email: '', password: 'pw' })).rejects.toThrow(ValidationError)
  })

  it('should throw ValidationError when password is missing', async () => {
    await expect(loginUseCase(prisma, { email: 'x@x.com', password: '' })).rejects.toThrow(ValidationError)
  })

  it('should throw UnauthorizedError when user does not exist', async () => {
    await expect(loginUseCase(prisma, { email: 'none@test.com', password: 'pw' })).rejects.toThrow(
      UnauthorizedError,
    )
  })
})
