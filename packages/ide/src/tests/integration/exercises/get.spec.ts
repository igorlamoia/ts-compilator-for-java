import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise } from '../helpers'
import { getExerciseUseCase } from '@/use-cases/exercises/get'
import { NotFoundError } from '@/lib/errors'

describe('getExerciseUseCase', () => {
  it('should return exercise with test cases', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const exercise = await createExercise(teacher.id, { title: 'Sum' })
    await prisma.testCase.create({
      data: { exerciseId: exercise.id, label: 'TC1', input: '5', expectedOutput: '25', orderIndex: 0 },
    })

    const result = await getExerciseUseCase(prisma, exercise.id)

    expect(result.title).toBe('Sum')
    expect(result.testCases[0].expectedOutput).toBe('25')
  })

  it('should throw NotFoundError when exercise does not exist', async () => {
    await expect(getExerciseUseCase(prisma, 'non-existent')).rejects.toThrow(NotFoundError)
  })
})
