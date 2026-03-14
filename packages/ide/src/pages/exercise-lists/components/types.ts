export type SubmissionRecord = {
  id: string;
  studentId: string;
  exerciseId: string;
  status: string;
  score: number | null;
  submittedAt: string;
  student?: { name: string; email: string };
  exercise?: { title: string };
};

export type ClassOption = { id: string; name: string };

export type ClassExerciseListEntry = {
  exerciseListId: string;
  classId: string;
  deadline: string;
  completedCount: number;
  totalCount: number;
  exerciseList: {
    items: { exerciseId: string; submitted: boolean; exercise: { id: string; title: string; status: string } }[];
  };
};
