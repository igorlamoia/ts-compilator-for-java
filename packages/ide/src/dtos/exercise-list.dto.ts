export type ExerciseListItemDTO = {
  exerciseId: number
  gradeWeight: number
  orderIndex: number
  exercise: { id: number; title: string }
}

export type ClassPublicationDTO = {
  classId: number
  totalGrade: number
  minRequired: number
  deadline: Date
  publishedAt?: Date
}

export type ExerciseListDTO = {
  id: number
  teacherId: number
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  items: ExerciseListItemDTO[]
  classes: ClassPublicationDTO[]
  submittedExerciseIds?: number[]
}

export function toExerciseListDTO(
  list: {
    id: number
    teacherId: number
    title: string
    description: string
    createdAt: Date
    updatedAt: Date
    items: {
      exerciseId: number
      gradeWeight: number
      orderIndex: number
      exercise: { id: number; title: string }
    }[]
    classes?: { classId: number; totalGrade: number; minRequired: number; deadline: Date; publishedAt?: Date }[]
  },
  submittedExerciseIds?: number[]
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
