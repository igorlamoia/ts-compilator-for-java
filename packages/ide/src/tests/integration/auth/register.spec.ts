import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser } from '../helpers'
import { registerUseCase } from '@/use-cases/auth/register'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'

describe('registerUseCase', () => {
  it('should create a student user with a valid organizationId', async () => {
    const org = await createOrg('CEFET-MG')

    const user = await registerUseCase(prisma, {
      name: 'Alice',
      email: 'alice@test.com',
      password: 'pw',
      role: 'student',
      organizationId: org.id,
    })

    expect(user.name).toBe('Alice')
    expect(user.email).toBe('alice@test.com')
    expect(user.role).toBe('STUDENT')
    expect(user.organizationId).toBe(org.id)
  })

  it('should assign TEACHER role when role is TEACHER', async () => {
    const org = await createOrg()

    const user = await registerUseCase(prisma, {
      name: 'Bob',
      email: 'bob@test.com',
      password: 'pw',
      role: 'TEACHER',
      organizationId: org.id,
    })

    expect(user.role).toBe('TEACHER')
  })

  it('should throw ValidationError when fields are missing', async () => {
    const org = await createOrg()

    await expect(
      registerUseCase(prisma, { name: '', email: 'x@x.com', password: 'pw', role: 'student', organizationId: org.id }),
    ).rejects.toThrow(ValidationError)
  })

  it('should throw ValidationError when organizationId is missing', async () => {
    await expect(
      registerUseCase(prisma, { name: 'Alice', email: 'alice@test.com', password: 'pw', role: 'student', organizationId: '' }),
    ).rejects.toThrow(ValidationError)
  })

  it('should throw NotFoundError when organizationId does not exist', async () => {
    await expect(
      registerUseCase(prisma, { name: 'Alice', email: 'alice@test.com', password: 'pw', role: 'student', organizationId: 'non-existent-org' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('should throw ConflictError when email already exists', async () => {
    const org = await createOrg()
    await createUser(org.id, { email: 'dup@test.com' })

    await expect(
      registerUseCase(prisma, { name: 'Dup', email: 'dup@test.com', password: 'pw', role: 'student', organizationId: org.id }),
    ).rejects.toThrow(ConflictError)
  })
})
