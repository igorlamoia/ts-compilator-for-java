import { describe, it, expect } from 'vitest'
import { prisma, createOrg } from '../helpers'
import { listOrganizationsUseCase } from '@/use-cases/organizations/list'

describe('listOrganizationsUseCase', () => {
  it('should return an empty array when no organizations exist', async () => {
    const result = await listOrganizationsUseCase(prisma)
    expect(result).toEqual([])
  })

  it('should return all organizations with id and name', async () => {
    await createOrg('CEFET-MG')
    await createOrg('UFJF')

    const result = await listOrganizationsUseCase(prisma)

    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result.every((o) => !('createdAt' in o))).toBe(true)
  })

  it('should return organizations ordered by name ascending', async () => {
    await createOrg('UFJF')
    await createOrg('CEFET-MG')

    const result = await listOrganizationsUseCase(prisma)

    expect(result[0].name).toBe('CEFET-MG')
    expect(result[1].name).toBe('UFJF')
  })
})
