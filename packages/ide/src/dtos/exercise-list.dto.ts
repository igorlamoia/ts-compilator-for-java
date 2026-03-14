export type ExerciseListItemDTO = {
  exerciseId: string
  gradeWeight: number
  orderIndex: number
  exercise: { id: string; title: string }
}

export type ClassPublicationDTO = {
  classId: string
  totalGrade: number
  minRequired: number
  deadline: Date
  publishedAt?: Date
}

export type ExerciseListDTO = {
  id: string
  teacherId: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  items: ExerciseListItemDTO[]
  classes: ClassPublicationDTO[]
  submittedExerciseIds?: string[]
}

export function toExerciseListDTO(
  list: {
    id: string
    teacherId: string
    title: string
    description: string
    createdAt: Date
    updatedAt: Date
    items: {
      exerciseId: string
      gradeWeight: number
      orderIndex: number
      exercise: { id: string; title: string }
    }[]
    classes?: { classId: string; totalGrade: number; minRequired: number; deadline: Date; publishedAt?: Date }[]
  },
  submittedExerciseIds?: string[]
): ExerciseListDTO {
  return {
    id: list.id,
    teacherId: list.teacherId,
    title: list.title,
    description: list.description,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    items: list.items.map((item) => ({
      exerciseId: item.exerciseId,
      gradeWeight: item.gradeWeight,
      orderIndex: item.orderIndex,
      exercise: item.exercise,
    })),
    classes: (list.classes ?? []).map((c) => ({
      classId: c.classId,
      totalGrade: c.totalGrade,
      minRequired: c.minRequired,
      deadline: c.deadline,
      publishedAt: c.publishedAt,
    })),
    submittedExerciseIds,
  }
}
