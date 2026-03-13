export type SubmissionStudentDTO = {
  id: string
  name: string
  email: string
}

export type SubmissionExerciseDTO = {
  id: string
  title: string
  description: string
}

export type SubmissionPublicationDTO = {
  totalGrade: number
  deadline: Date
  minRequired: number
}

export type SubmissionDTO = {
  id: string
  exerciseId: string
  exerciseListId: string
  classId: string
  studentId: string
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
  id: string
  exerciseId: string
  exerciseListId: string
  classId: string
  studentId: string
  codeSnapshot: string
  status: string
  score: number | null
  teacherFeedback: string | null
  submittedAt: Date
  student?: { id: string; name: string; email: string; [key: string]: unknown } | null
  exercise?: { id: string; title: string; description: string } | null
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
