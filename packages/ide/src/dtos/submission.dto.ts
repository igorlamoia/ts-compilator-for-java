export type SubmissionStudentDTO = {
  id: string
  name: string
  email: string
}

export type SubmissionExerciseDTO = {
  id: string
  title: string
  description: string
  gradeWeight: number
  classId: string
}

export type SubmissionDTO = {
  id: string
  exerciseId: string
  studentId: string
  codeSnapshot: string
  status: string
  score: number | null
  teacherFeedback: string | null
  submittedAt: Date
  student?: SubmissionStudentDTO
  exercise?: SubmissionExerciseDTO
}

export function toSubmissionDTO(submission: {
  id: string
  exerciseId: string
  studentId: string
  codeSnapshot: string
  status: string
  score: number | null
  teacherFeedback: string | null
  submittedAt: Date
  student?: { id: string; name: string; email: string; [key: string]: unknown } | null
  exercise?: { id: string; title: string; description: string; gradeWeight: number; classId: string } | null
}): SubmissionDTO {
  return {
    id: submission.id,
    exerciseId: submission.exerciseId,
    studentId: submission.studentId,
    codeSnapshot: submission.codeSnapshot,
    status: submission.status,
    score: submission.score,
    teacherFeedback: submission.teacherFeedback,
    submittedAt: submission.submittedAt,
    ...(submission.student
      ? { student: { id: submission.student.id, name: submission.student.name, email: submission.student.email } }
      : {}),
    ...(submission.exercise
      ? {
          exercise: {
            id: submission.exercise.id,
            title: submission.exercise.title,
            description: submission.exercise.description,
            gradeWeight: submission.exercise.gradeWeight,
            classId: submission.exercise.classId,
          },
        }
      : {}),
  }
}
