import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass } from '../helpers'
import { listClassesUseCase } from '@/use-cases/classes/list'

describe('listClassesUseCase', () => {
  it('should return classes for an organization', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    await createClass(org.id, teacher.id, { name: 'Math' })
    await createClass(org.id, teacher.id, { name: 'Physics' })

    const classes = await listClassesUseCase(prisma, org.id)

    expect(classes).toHaveLength(2)
    expect(classes.map((c) => c.name)).toContain('Math')
    expect(classes.map((c) => c.name)).toContain('Physics')
  })

  it('should not return classes from other organizations', async () => {
    const org1 = await createOrg('Org 1')
    const org2 = await createOrg('Org 2')
    const t1 = await createUser(org1.id, { role: 'TEACHER' })
    const t2 = await createUser(org2.id, { role: 'TEACHER' })
    await createClass(org1.id, t1.id, { name: 'Org1 Class' })
    await createClass(org2.id, t2.id, { name: 'Org2 Class' })

    const classes = await listClassesUseCase(prisma, org1.id)

    expect(classes).toHaveLength(1)
    expect(classes[0].name).toBe('Org1 Class')
  })

  it('should return empty array when organization has no classes', async () => {
    const org = await createOrg()
    const classes = await listClassesUseCase(prisma, org.id)
    expect(classes).toEqual([])
  })

  it('should include member and exercise counts', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    await createClass(org.id, teacher.id)

    const classes = await listClassesUseCase(prisma, org.id)

    expect(classes[0]._count).toHaveProperty('members')
    expect(classes[0]._count).toHaveProperty('exercises')
  })
})
