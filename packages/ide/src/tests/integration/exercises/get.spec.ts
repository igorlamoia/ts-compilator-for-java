import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise } from '../helpers'
import { getExerciseUseCase } from '@/use-cases/exercises/get'
import { NotFoundError } from '@/lib/errors'

describe('getExerciseUseCase', () => {
  it('should return exercise with full test cases for teacher', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id, { title: 'Sum' })
    await prisma.testCase.create({
      data: { exerciseId: exercise.id, label: 'TC1', input: '5', expectedOutput: '25', orderIndex: 0 },
    })

    const result = await getExerciseUseCase(prisma, { id: exercise.id, userId: teacher.id })

    expect(result.title).toBe('Sum')
    expect(result.testCases[0].expectedOutput).toBe('25')
  })

  it('should mask expectedOutput for students', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)
    await prisma.testCase.create({
      data: { exerciseId: exercise.id, label: 'TC1', input: '5', expectedOutput: 'secret', orderIndex: 0 },
    })

    const result = await getExerciseUseCase(prisma, { id: exercise.id, userId: student.id })

    expect(result.testCases[0].expectedOutput).toBe('')
  })

  it('should throw NotFoundError when exercise does not exist', async () => {
    const org = await createOrg()
    const user = await createUser(org.id)

    await expect(getExerciseUseCase(prisma, { id: 'non-existent', userId: user.id })).rejects.toThrow(
      NotFoundError,
    )
  })
})
