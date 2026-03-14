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
import { validateSubmissionUseCase } from '@/use-cases/compiler/validate-submission'

const VALID_CODE = `int main() {
  int x;
  x = 7;
  print(x);
}`

describe('deadline enforcement', () => {
  it('should create submission with SUBMITTED status when within deadline', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    const list = await createExerciseList(teacher.id)
    await createExerciseListItem(list.id, exercise.id)
    await createClassExerciseList(list.id, cls.id, {
      deadline: new Date(Date.now() + 7 * 86400000), // 7 days in future
    })

    const result = await validateSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      exerciseListId: list.id,
      classId: cls.id,
      sourceCode: VALID_CODE,
      userId: student.id,
      dryRun: false,
    })

    expect(result.valid).toBe(true)
    expect(result.submissionId).toBeDefined()

    const submission = await prisma.submission.findUnique({
      where: { id: result.submissionId! },
    })
    expect(submission!.status).toBe('SUBMITTED')
  })

  it('should create submission with LATE status when past deadline', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    const list = await createExerciseList(teacher.id)
    await createExerciseListItem(list.id, exercise.id)
    await createClassExerciseList(list.id, cls.id, {
      deadline: new Date(Date.now() - 86400000), // 1 day in the past
    })

    const result = await validateSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      exerciseListId: list.id,
      classId: cls.id,
      sourceCode: VALID_CODE,
      userId: student.id,
      dryRun: false,
    })

    expect(result.valid).toBe(true)
    expect(result.submissionId).toBeDefined()
    expect(result.warnings).toContain('Submissão após o prazo — será marcada como atrasada.')

    const submission = await prisma.submission.findUnique({
      where: { id: result.submissionId! },
    })
    expect(submission!.status).toBe('LATE')
  })

  it('should still compile and return results in dryRun even past deadline', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)

    const result = await validateSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      sourceCode: VALID_CODE,
      userId: student.id,
      dryRun: true,
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
