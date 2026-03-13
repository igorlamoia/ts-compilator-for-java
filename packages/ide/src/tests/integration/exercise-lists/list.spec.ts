import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createExerciseList } from '../helpers'
import { listExerciseListsUseCase } from '@/use-cases/exercise-lists/list'

describe('listExerciseListsUseCase', () => {
  it('should return lists for a teacher', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    await createExerciseList(teacher.id, { title: 'Lista A' })
    await createExerciseList(teacher.id, { title: 'Lista B' })

    const lists = await listExerciseListsUseCase(prisma, { teacherId: teacher.id })

    expect(lists).toHaveLength(2)
    expect(lists.map((l) => l.title)).toContain('Lista A')
  })

  it('should not return lists from other teachers', async () => {
    const org = await createOrg()
    const teacher1 = await createUser(org.id, { role: 'TEACHER' })
    const teacher2 = await createUser(org.id, { role: 'TEACHER' })
    await createExerciseList(teacher1.id)

    const lists = await listExerciseListsUseCase(prisma, { teacherId: teacher2.id })

    expect(lists).toHaveLength(0)
  })
})
