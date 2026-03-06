import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass } from '../helpers'
import { joinClassUseCase } from '@/use-cases/classes/join'
import { NotFoundError } from '@/lib/errors'

describe('joinClassUseCase', () => {
  it('should create a membership and return classId', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id, { accessCode: 'JOIN-01' })
    const student = await createUser(org.id)

    const result = await joinClassUseCase(prisma, { userId: student.id, accessCode: 'JOIN-01' })

    expect(result.classId).toBe(cls.id)
    const membership = await prisma.classMember.findUnique({
      where: { classId_studentId: { classId: cls.id, studentId: student.id } },
    })
    expect(membership).not.toBeNull()
  })

  it('should be idempotent when called twice with the same user and class', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id, { accessCode: 'JOIN-02' })
    const student = await createUser(org.id)

    await joinClassUseCase(prisma, { userId: student.id, accessCode: 'JOIN-02' })
    await joinClassUseCase(prisma, { userId: student.id, accessCode: 'JOIN-02' })

    const memberships = await prisma.classMember.findMany({
      where: { classId: cls.id, studentId: student.id },
    })
    expect(memberships).toHaveLength(1)
  })

  it('should throw NotFoundError when access code does not exist', async () => {
    const org = await createOrg()
    const student = await createUser(org.id)

    await expect(
      joinClassUseCase(prisma, { userId: student.id, accessCode: 'WRONG' }),
    ).rejects.toThrow(NotFoundError)
  })
})
