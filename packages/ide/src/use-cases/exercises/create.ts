import type { PrismaClient } from '@prisma/client'

type TestCaseInput = { label?: string; input?: string; expectedOutput?: string }

export async function createExerciseUseCase(
  prisma: PrismaClient,
  input: {
    teacherId: string
    title: string
    description: string
    testCases?: TestCaseInput[]
  },
) {
  const { teacherId, title, description, testCases } = input

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
      teacherId,
      title,
      description,
      attachments: '',
      ...(testCasesData.length > 0 && { testCases: { create: testCasesData } }),
    },
    include: { testCases: true },
  })
}
