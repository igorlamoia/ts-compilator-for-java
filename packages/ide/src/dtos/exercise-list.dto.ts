export type ExerciseListItemDTO = {
  exerciseId: string
  gradeWeight: number
  orderIndex: number
  exercise: { id: string; title: string; status: string }
}

export type ClassPublicationDTO = {
  classId: string
  deadline: Date
  totalGrade: number
  minRequired: number
}

export type ExerciseListDTO = {
  id: string
  teacherId: string
  title: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
  items: ExerciseListItemDTO[]
  classes: ClassPublicationDTO[]
}

export function toExerciseListDTO(list: {
  id: string
  teacherId: string
  title: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
  items: {
    exerciseId: string
    gradeWeight: number
    orderIndex: number
    exercise: { id: string; title: string; status: string }
  }[]
  classes: { classId: string; deadline: Date; totalGrade: number; minRequired: number }[]
}): ExerciseListDTO {
  return {
    id: list.id,
    teacherId: list.teacherId,
    title: list.title,
    description: list.description,
    status: list.status,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    items: list.items.map((item) => ({
      exerciseId: item.exerciseId,
      gradeWeight: item.gradeWeight,
      orderIndex: item.orderIndex,
      exercise: item.exercise,
    })),
    classes: list.classes,
  }
}
