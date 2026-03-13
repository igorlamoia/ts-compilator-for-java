import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise, createExerciseList } from '../helpers'
import { listExercisesUseCase } from '@/use-cases/exercises/list'
import { ValidationError } from '@/lib/errors'

describe('listExercisesUseCase', () => {
  it('should return exercises for a teacher', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    await createExercise(teacher.id, { title: 'Ex 1' })
    await createExercise(teacher.id, { title: 'Ex 2' })

    const exercises = await listExercisesUseCase(prisma, { teacherId: teacher.id })

    expect(exercises).toHaveLength(2)
    expect(exercises.map((e) => e.title)).toContain('Ex 1')
  })

  it('should return empty array when teacher has no exercises', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })

    const exercises = await listExercisesUseCase(prisma, { teacherId: teacher.id })

    expect(exercises).toEqual([])
  })

  it('should not return exercises from other teachers', async () => {
    const org = await createOrg()
    const teacher1 = await createUser(org.id, { role: 'TEACHER' })
    const teacher2 = await createUser(org.id, { role: 'TEACHER' })
    await createExercise(teacher1.id, { title: 'T1 Exercise' })

    const exercises = await listExercisesUseCase(prisma, { teacherId: teacher2.id })

    expect(exercises).toHaveLength(0)
  })

  it('should throw ValidationError when teacherId is empty', async () => {
    await expect(listExercisesUseCase(prisma, { teacherId: '' })).rejects.toThrow(ValidationError)
  })
})
