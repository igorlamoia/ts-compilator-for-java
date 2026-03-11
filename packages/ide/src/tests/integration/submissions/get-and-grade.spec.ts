import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise, createSubmission } from '../helpers'
import { getSubmissionUseCase } from '@/use-cases/submissions/get'
import { gradeSubmissionUseCase } from '@/use-cases/submissions/grade'
import { listSubmissionsUseCase } from '@/use-cases/submissions/list'
import { NotFoundError, ValidationError } from '@/lib/errors'

describe('getSubmissionUseCase', () => {
  it('should return submission with student and exercise data', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id, { name: 'Alice' })
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id, { title: 'My Exercise' })
    const submission = await createSubmission(exercise.id, student.id)

    const result = await getSubmissionUseCase(prisma, submission.id)

    expect(result.id).toBe(submission.id)
    expect(result.student.name).toBe('Alice')
    expect(result.exercise.title).toBe('My Exercise')
  })

  it('should throw NotFoundError when submission does not exist', async () => {
    await expect(getSubmissionUseCase(prisma, 'non-existent')).rejects.toThrow(NotFoundError)
  })
})

describe('gradeSubmissionUseCase', () => {
  it('should update score, feedback and set status to GRADED', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)
    const submission = await createSubmission(exercise.id, student.id)

    const graded = await gradeSubmissionUseCase(prisma, {
      id: submission.id,
      score: 9.5,
      teacherFeedback: 'Excellent!',
    })

    expect(graded.status).toBe('GRADED')
    expect(graded.score).toBe(9.5)
    expect(graded.teacherFeedback).toBe('Excellent!')
  })

  it('should grade without feedback', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)
    const submission = await createSubmission(exercise.id, student.id)

    const graded = await gradeSubmissionUseCase(prisma, { id: submission.id, score: 7 })

    expect(graded.status).toBe('GRADED')
    expect(graded.score).toBe(7)
  })
})

describe('listSubmissionsUseCase', () => {
  it('should return all submissions for an exercise', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const s1 = await createUser(org.id)
    const s2 = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(cls.id)
    await createSubmission(exercise.id, s1.id)
    await createSubmission(exercise.id, s2.id)

    const submissions = await listSubmissionsUseCase(prisma, exercise.id)

    expect(submissions).toHaveLength(2)
  })

  it('should throw ValidationError when exerciseId is empty', async () => {
    await expect(listSubmissionsUseCase(prisma, '')).rejects.toThrow(ValidationError)
  })
})
