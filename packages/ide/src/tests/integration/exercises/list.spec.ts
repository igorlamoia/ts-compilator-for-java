import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise } from '../helpers'
import { listExercisesUseCase } from '@/use-cases/exercises/list'
import { ValidationError } from '@/lib/errors'

describe('listExercisesUseCase', () => {
  it('should return exercises for a class', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)
    await createExercise(cls.id, { title: 'Ex 1' })
    await createExercise(cls.id, { title: 'Ex 2' })

    const exercises = await listExercisesUseCase(prisma, { classId: cls.id, userId: teacher.id })

    expect(exercises).toHaveLength(2)
    expect(exercises.map((e) => e.title)).toContain('Ex 1')
  })

  it('should return empty array when class has no exercises', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const cls = await createClass(org.id, teacher.id)

    const exercises = await listExercisesUseCase(prisma, { classId: cls.id, userId: teacher.id })

    expect(exercises).toEqual([])
  })

  it('should include last submission for the user', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)
    await prisma.submission.create({
      data: { exerciseId: exercise.id, studentId: student.id, codeSnapshot: 'code', status: 'SUBMITTED' },
    })

    const exercises = await listExercisesUseCase(prisma, { classId: cls.id, userId: student.id })

    expect(exercises[0].submissions).toHaveLength(1)
    expect(exercises[0].submissions[0].status).toBe('SUBMITTED')
  })

  it('should throw ValidationError when classId is empty', async () => {
    await expect(listExercisesUseCase(prisma, { classId: '', userId: 'u1' })).rejects.toThrow(ValidationError)
  })
})
