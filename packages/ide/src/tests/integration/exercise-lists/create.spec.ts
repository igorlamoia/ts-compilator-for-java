import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser } from '../helpers'
import { createExerciseListUseCase } from '@/use-cases/exercise-lists/create'
import { ValidationError } from '@/lib/errors'

describe('createExerciseListUseCase', () => {
  it('should create an exercise list for a teacher', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })

    const list = await createExerciseListUseCase(prisma, {
      teacherId: teacher.id,
      title: 'Lista 1',
      description: 'Primeira lista',
    })

    expect(list.id).toBeDefined()
    expect(list.teacherId).toBe(teacher.id)
    expect(list.title).toBe('Lista 1')
    expect(list.status).toBe('DRAFT')
  })

  it('should throw ValidationError when title is empty', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })

    await expect(
      createExerciseListUseCase(prisma, { teacherId: teacher.id, title: '', description: 'desc' })
    ).rejects.toThrow(ValidationError)
  })
})
