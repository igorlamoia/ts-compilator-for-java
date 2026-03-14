import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass } from '../helpers'
import { listClassesUseCase } from '@/use-cases/classes/list'

describe('listClassesUseCase', () => {
  it('should return classes for a teacher in the organization', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    await createClass(org.id, teacher.id, { name: 'Math' })
    await createClass(org.id, teacher.id, { name: 'Physics' })

    const classes = await listClassesUseCase(prisma, org.id, teacher.id)

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

    const classes = await listClassesUseCase(prisma, org1.id, t1.id)

    expect(classes).toHaveLength(1)
    expect(classes[0].name).toBe('Org1 Class')
  })

  it('should return empty array when teacher has no classes', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const classes = await listClassesUseCase(prisma, org.id, teacher.id)
    expect(classes).toEqual([])
  })

  it('should include member and exercise counts', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    await createClass(org.id, teacher.id)

    const classes = await listClassesUseCase(prisma, org.id, teacher.id)

    expect(classes[0]._count).toHaveProperty('members')
    expect(classes[0]._count).toHaveProperty('exerciseLists')
  })

  it('should return only joined classes for a student', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id, { role: 'STUDENT' })

    const joinedClass = await createClass(org.id, teacher.id, { name: 'Joined' })
    await createClass(org.id, teacher.id, { name: 'Not Joined' })

    // Student joins only the first class
    await prisma.classMember.create({
      data: { classId: joinedClass.id, studentId: student.id },
    })

    const classes = await listClassesUseCase(prisma, org.id, student.id)

    expect(classes).toHaveLength(1)
    expect(classes[0].name).toBe('Joined')
  })
})
