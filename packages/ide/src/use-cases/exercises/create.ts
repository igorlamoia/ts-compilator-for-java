import type { PrismaClient } from '@prisma/client'

type TestCaseInput = { label?: string; input?: string; expectedOutput?: string }

export async function createExerciseUseCase(
  prisma: PrismaClient,
  input: {
    classId: string
    title: string
    description: string
    deadline: string
    gradeWeight: number | string
    testCases?: TestCaseInput[]
  },
) {
  const { classId, title, description, deadline, gradeWeight, testCases } = input

  const testCasesData = Array.isArray(testCases)
    ? testCases
        .filter((tc) => tc.input?.trim() || tc.expectedOutput?.trim())
        .map((tc, index) => ({
          label: tc.label || '',
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          orderIndex: index,
        }))
    : []

  return prisma.exercise.create({
    data: {
      classId,
      title,
      description,
      deadline: new Date(deadline),
      gradeWeight: Number(gradeWeight),
      attachments: '',
      ...(testCasesData.length > 0 && { testCases: { create: testCasesData } }),
    },
    include: { testCases: true },
  })
}
