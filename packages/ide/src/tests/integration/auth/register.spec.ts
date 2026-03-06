import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser } from '../helpers'
import { registerUseCase } from '@/use-cases/auth/register'
import { ValidationError, ConflictError } from '@/lib/errors'

describe('registerUseCase', () => {
  it('should create a student user with a default organization', async () => {
    const user = await registerUseCase(prisma, {
      name: 'Alice',
      email: 'alice@test.com',
      password: 'pw',
      role: 'student',
    })

    expect(user.name).toBe('Alice')
    expect(user.email).toBe('alice@test.com')
    expect(user.role).toBe('STUDENT')
  })

  it('should assign TEACHER role when role is TEACHER', async () => {
    const user = await registerUseCase(prisma, {
      name: 'Bob',
      email: 'bob@test.com',
      password: 'pw',
      role: 'TEACHER',
    })

    expect(user.role).toBe('TEACHER')
  })

  it('should reuse existing Default Organization', async () => {
    await registerUseCase(prisma, { name: 'A', email: 'a@test.com', password: 'pw', role: 'student' })
    await registerUseCase(prisma, { name: 'B', email: 'b@test.com', password: 'pw', role: 'student' })

    const orgs = await prisma.organization.findMany({ where: { name: 'Default Organization' } })
    expect(orgs).toHaveLength(1)
  })

  it('should throw ValidationError when fields are missing', async () => {
    await expect(
      registerUseCase(prisma, { name: '', email: 'x@x.com', password: 'pw', role: 'student' }),
    ).rejects.toThrow(ValidationError)
  })

  it('should throw ConflictError when email already exists', async () => {
    const org = await createOrg()
    await createUser(org.id, { email: 'dup@test.com' })

    await expect(
      registerUseCase(prisma, { name: 'Dup', email: 'dup@test.com', password: 'pw', role: 'student' }),
    ).rejects.toThrow(ConflictError)
  })
})
