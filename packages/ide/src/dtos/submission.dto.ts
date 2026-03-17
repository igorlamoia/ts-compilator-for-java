export type SubmissionStudentDTO = {
  id: number
  name: string
  email: string
}

export type SubmissionExerciseDTO = {
  id: number
  title: string
  description: string
}

export type SubmissionPublicationDTO = {
  totalGrade: number
  deadline: Date
  minRequired: number
}

export type SubmissionDTO = {
  id: number
  exerciseId: number
  exerciseListId: number
  classId: number
  studentId: number
  codeSnapshot: string
  status: string
  score: number | null
  teacherFeedback: string | null
  submittedAt: Date
  student?: SubmissionStudentDTO
  exercise?: SubmissionExerciseDTO
  publication?: SubmissionPublicationDTO
}

export function toSubmissionDTO(submission: {
  id: number
  exerciseId: number
  exerciseListId: number
  classId: number
  studentId: number
  codeSnapshot: string
  status: string
  score: number | null
  teacherFeedback: string | null
  submittedAt: Date
  student?: { id: number; name: string; email: string; [key: string]: unknown } | null
  exercise?: { id: number; title: string; description: string } | null
  publication?: { totalGrade: number; deadline: Date; minRequired: number } | null
}): SubmissionDTO {
  return {
    id: submission.id,
    exerciseId: submission.exerciseId,
    exerciseListId: submission.exerciseListId,
    classId: submission.classId,
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
          },
        }
      : {}),
    ...(submission.publication
      ? {
          publication: {
            totalGrade: submission.publication.totalGrade,
            deadline: submission.publication.deadline,
            minRequired: submission.publication.minRequired,
          },
        }
      : {}),
  }
}
