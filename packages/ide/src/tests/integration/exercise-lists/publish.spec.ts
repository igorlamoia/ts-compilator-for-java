import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExerciseList } from '../helpers'
import { publishExerciseListUseCase } from '@/use-cases/exercise-lists/publish'
import { ValidationError, ForbiddenError } from '@/lib/errors'

describe('publishExerciseListUseCase', () => {
  it('should publish a list to a class', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)
    const list = await createExerciseList(teacher.id)

    const publication = await publishExerciseListUseCase(prisma, {
      exerciseListId: list.id,
      classId: cls.id,
      callerId: teacher.id,
      deadline: new Date(Date.now() + 7 * 86400000),
      totalGrade: 10,
      minRequired: 2,
    })

    expect(publication.exerciseListId).toBe(list.id)
    expect(publication.classId).toBe(cls.id)
    expect(publication.minRequired).toBe(2)
  })

  it('should throw ValidationError when minRequired is less than 1', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)
    const list = await createExerciseList(teacher.id)

    await expect(
      publishExerciseListUseCase(prisma, {
        exerciseListId: list.id,
        classId: cls.id,
        callerId: teacher.id,
        deadline: new Date(Date.now() + 86400000),
        totalGrade: 10,
        minRequired: 0,
      })
    ).rejects.toThrow(ValidationError)
  })

  it('should allow same list published to two classes with different deadlines', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const clsA = await createClass(org.id, teacher.id)
    const clsB = await createClass(org.id, teacher.id)
    const list = await createExerciseList(teacher.id)

    const deadlineA = new Date(Date.now() + 3 * 86400000)
    const deadlineB = new Date(Date.now() + 7 * 86400000)

    await publishExerciseListUseCase(prisma, {
      exerciseListId: list.id, classId: clsA.id, callerId: teacher.id, deadline: deadlineA, totalGrade: 10, minRequired: 1,
    })
    await publishExerciseListUseCase(prisma, {
      exerciseListId: list.id, classId: clsB.id, callerId: teacher.id, deadline: deadlineB, totalGrade: 10, minRequired: 1,
    })

    const pubA = await prisma.classExerciseList.findUnique({
      where: { exerciseListId_classId: { exerciseListId: list.id, classId: clsA.id } },
    })
    const pubB = await prisma.classExerciseList.findUnique({
      where: { exerciseListId_classId: { exerciseListId: list.id, classId: clsB.id } },
    })

    expect(pubA!.deadline.getTime()).toBe(deadlineA.getTime())
    expect(pubB!.deadline.getTime()).toBe(deadlineB.getTime())
  })

  it('should update an existing publication (upsert behavior)', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)
    const list = await createExerciseList(teacher.id)

    const firstDeadline = new Date(Date.now() + 3 * 86400000)
    const newDeadline = new Date(Date.now() + 10 * 86400000)

    await publishExerciseListUseCase(prisma, {
      exerciseListId: list.id, classId: cls.id, callerId: teacher.id, deadline: firstDeadline, totalGrade: 10, minRequired: 1,
    })
    await publishExerciseListUseCase(prisma, {
      exerciseListId: list.id, classId: cls.id, callerId: teacher.id, deadline: newDeadline, totalGrade: 20, minRequired: 2,
    })

    const pub = await prisma.classExerciseList.findUnique({
      where: { exerciseListId_classId: { exerciseListId: list.id, classId: cls.id } },
    })

    expect(pub!.deadline.getTime()).toBe(newDeadline.getTime())
    expect(pub!.totalGrade).toBe(20)
    expect(pub!.minRequired).toBe(2)
  })

  it('should throw ForbiddenError when caller is not the list owner', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const otherUser = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)
    const list = await createExerciseList(teacher.id)

    await expect(
      publishExerciseListUseCase(prisma, {
        exerciseListId: list.id,
        classId: cls.id,
        callerId: otherUser.id,
        deadline: new Date(Date.now() + 86400000),
        totalGrade: 10,
        minRequired: 1,
      })
    ).rejects.toThrow(ForbiddenError)
  })
})
