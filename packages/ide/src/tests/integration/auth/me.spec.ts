import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser } from '../helpers'
import { getMeUseCase } from '@/use-cases/auth/me'
import { NotFoundError } from '@/lib/errors'

describe('getMeUseCase', () => {
  it('should return user by id', async () => {
    const org = await createOrg()
    const user = await createUser(org.id, { email: 'me@test.com', name: 'Me User' })

    const result = await getMeUseCase(prisma, user.id)

    expect(result.id).toBe(user.id)
    expect(result.name).toBe('Me User')
  })

  it('should throw NotFoundError when user does not exist', async () => {
    await expect(getMeUseCase(prisma, 'non-existent-id')).rejects.toThrow(NotFoundError)
  })
})
