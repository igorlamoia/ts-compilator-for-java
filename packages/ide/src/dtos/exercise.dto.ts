export type TestCaseDTO = {
  id: string
  label: string
  input: string
  expectedOutput: string
  orderIndex: number
}

export type ExerciseDTO = {
  id: string
  teacherId: string
  title: string
  description: string
  createdAt: Date
  testCases: TestCaseDTO[]
}

export function toExerciseDTO(exercise: {
  id: string
  teacherId: string
  title: string
  description: string
  attachments?: string
  createdAt: Date
  testCases?: { id: string; label: string; input: string; expectedOutput: string; orderIndex: number }[]
}): ExerciseDTO {
  return {
    id: exercise.id,
    teacherId: exercise.teacherId,
    title: exercise.title,
    description: exercise.description,
    createdAt: exercise.createdAt,
    testCases: exercise.testCases ?? [],
  }
}
