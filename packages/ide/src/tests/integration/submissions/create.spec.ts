import { describe, it, expect } from 'vitest'
import {
  prisma,
  createOrg,
  createUser,
  createClass,
  createExercise,
  createExerciseList,
  createExerciseListItem,
  createClassExerciseList,
} from '../helpers'
import { createSubmissionUseCase } from '@/use-cases/submissions/create'
import { ValidationError } from '@/lib/errors'

describe('createSubmissionUseCase', () => {
  it('should create a submission with PENDING status by default', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    const exerciseList = await createExerciseList(teacher.id)
    await createExerciseListItem(exerciseList.id, exercise.id)
    await createClassExerciseList(exerciseList.id, cls.id)

    const submission = await createSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      studentId: student.id,
      exerciseListId: exerciseList.id,
      classId: cls.id,
      codeSnapshot: 'int main() {}',
    })

    expect(submission.status).toBe('PENDING')
    expect(submission.exerciseId).toBe(exercise.id)
    expect(submission.studentId).toBe(student.id)
    expect(submission.exerciseListId).toBe(exerciseList.id)
    expect(submission.classId).toBe(cls.id)
  })

  it('should create a submission with a custom status', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    const exerciseList = await createExerciseList(teacher.id)
    await createExerciseListItem(exerciseList.id, exercise.id)
    await createClassExerciseList(exerciseList.id, cls.id)

    const submission = await createSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      studentId: student.id,
      exerciseListId: exerciseList.id,
      classId: cls.id,
      codeSnapshot: 'code',
      status: 'SUBMITTED',
    })

    expect(submission.status).toBe('SUBMITTED')
  })

  it('should throw ValidationError when exercise does not belong to the list', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    const exerciseList = await createExerciseList(teacher.id)
    await createClassExerciseList(exerciseList.id, cls.id)
    // Note: no createExerciseListItem — exercise not linked to list

    await expect(
      createSubmissionUseCase(prisma, {
        exerciseId: exercise.id,
        studentId: student.id,
        exerciseListId: exerciseList.id,
        classId: cls.id,
        codeSnapshot: 'int main() {}',
      }),
    ).rejects.toThrow(ValidationError)
  })
})
