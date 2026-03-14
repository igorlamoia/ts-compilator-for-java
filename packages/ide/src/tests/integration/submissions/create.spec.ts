import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise } from '../helpers'
import { createSubmissionUseCase } from '@/use-cases/submissions/create'

describe('createSubmissionUseCase', () => {
  it('should create a submission with PENDING status by default', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)

    const submission = await createSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      studentId: student.id,
      codeSnapshot: 'int main() {}',
    })

    expect(submission.status).toBe('PENDING')
    expect(submission.exerciseId).toBe(exercise.id)
    expect(submission.studentId).toBe(student.id)
  })

  it('should create a submission with a custom status', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)

    const submission = await createSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      studentId: student.id,
      codeSnapshot: 'code',
      status: 'SUBMITTED',
    })

    expect(submission.status).toBe('SUBMITTED')
  })
})
