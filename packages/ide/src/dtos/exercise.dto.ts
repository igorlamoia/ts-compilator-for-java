export type TestCaseDTO = {
  id: string
  label: string
  input: string
  expectedOutput: string
  orderIndex: number
}

export type ExerciseSubmissionSnapshotDTO = {
  id: string
  status: string
  score: number | null
  teacherFeedback: string | null
  submittedAt: Date
}

export type ExerciseDTO = {
  id: string
  classId: string
  title: string
  description: string
  deadline: Date
  gradeWeight: number
  status: string
  testCases: TestCaseDTO[]
  submissions: ExerciseSubmissionSnapshotDTO[]
}

export function toExerciseDTO(exercise: {
  id: string
  classId: string
  title: string
  description: string
  attachments?: string
  deadline: Date
  gradeWeight: number
  status: string
  testCases?: { id: string; label: string; input: string; expectedOutput: string; orderIndex: number }[]
  submissions?: {
    id: string
    status: string
    score: number | null
    teacherFeedback: string | null
    submittedAt: Date
  }[]
  class?: unknown
}): ExerciseDTO {
  return {
    id: exercise.id,
    classId: exercise.classId,
    title: exercise.title,
    description: exercise.description,
    deadline: exercise.deadline,
    gradeWeight: exercise.gradeWeight,
    status: exercise.status,
    testCases: exercise.testCases ?? [],
    submissions: exercise.submissions ?? [],
  }
}
