export type SubmissionRecord = {
  id: number;
  studentId: number;
  exerciseId: number;
  status: string;
  score: number | null;
  submittedAt: string;
  student?: { name: string; email: string };
  exercise?: { title: string };
};

export type ClassOption = { id: number; name: string };

export type ClassExerciseListEntry = {
  exerciseListId: number;
  classId: number;
  deadline: string;
  completedCount: number;
  totalCount: number;
  exerciseList: {
    items: { exerciseId: number; submitted: boolean; exercise: { id: number; title: string; status: string } }[];
  };
};
