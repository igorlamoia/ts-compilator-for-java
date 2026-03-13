import { describe, it, expect } from 'vitest'
import { prisma, createOrg, createUser, createClass, createExercise } from '../helpers'
import { validateSubmissionUseCase } from '@/use-cases/compiler/validate-submission'

const VALID_CODE = `int main() {
  int x;
  x = 7;
  print(x);
}`

const INVALID_CODE = `int main() { @ invalid }`

describe('validateSubmissionUseCase', () => {
  it('should return valid:true for correct code (dryRun)', async () => {
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

  it('should return valid:false for lexical error', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)

    const result = await validateSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      sourceCode: INVALID_CODE,
      userId: student.id,
      dryRun: true,
    })

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Erro léxico')
  })

  it('should run test cases and report results', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    await prisma.testCase.create({
      data: { exerciseId: exercise.id, label: 'Print 7', input: '', expectedOutput: '7', orderIndex: 0 },
    })

    const result = await validateSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      sourceCode: VALID_CODE,
      userId: student.id,
      dryRun: true,
    })

    expect(result.testCasesTotal).toBe(1)
    expect(result.testCasesPassed).toBe(1)
    expect(result.testCaseResults![0].passed).toBe(true)
  })

  it('should report failing test cases', async () => {
    const org = await createOrg()
    const teacher = await createUser(org.id, { role: 'TEACHER' })
    const student = await createUser(org.id)
    const cls = await createClass(org.id, teacher.id)
    const exercise = await createExercise(teacher.id)
    await prisma.testCase.create({
      data: { exerciseId: exercise.id, label: 'Wrong', input: '', expectedOutput: '99', orderIndex: 0 },
    })

    const result = await validateSubmissionUseCase(prisma, {
      exerciseId: exercise.id,
      sourceCode: VALID_CODE,
      userId: student.id,
      dryRun: true,
    })

    expect(result.testCasesPassed).toBe(0)
    expect(result.testCaseResults![0].passed).toBe(false)
  })
})
