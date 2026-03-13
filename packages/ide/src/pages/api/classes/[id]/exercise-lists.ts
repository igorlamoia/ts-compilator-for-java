import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) return res.status(401).json({ error: "Não autorizado" });

  const { id: classId } = req.query as { id: string };
  if (!classId) return res.status(400).json({ error: "classId inválido" });

  if (req.method === "GET") {
    const [classExerciseLists, submissions] = await Promise.all([
      prisma.classExerciseList.findMany({
        where: { classId },
        include: {
          exerciseList: {
            include: {
              items: {
                orderBy: { orderIndex: "asc" },
                include: {
                  exercise: { select: { id: true, title: true, status: true } },
                },
              },
            },
          },
        },
        orderBy: { deadline: "asc" },
      }),
      prisma.submission.findMany({
        where: { studentId: userId, classId },
        select: { exerciseId: true, status: true, exerciseListId: true },
      }),
    ]);

    const submittedExerciseIds = new Set(submissions.map((s) => s.exerciseId));

    const result = classExerciseLists.map((cel) => ({
      exerciseListId: cel.exerciseListId,
      classId: cel.classId,
      deadline: cel.deadline,
      totalGrade: cel.totalGrade,
      minRequired: cel.minRequired,
      exerciseList: {
        id: cel.exerciseList.id,
        title: cel.exerciseList.title,
        description: cel.exerciseList.description,
        items: cel.exerciseList.items.map((item) => ({
          exerciseId: item.exerciseId,
          orderIndex: item.orderIndex,
          gradeWeight: item.gradeWeight,
          exercise: item.exercise,
          submitted: submittedExerciseIds.has(item.exerciseId),
        })),
      },
      completedCount: cel.exerciseList.items.filter((item) =>
        submittedExerciseIds.has(item.exerciseId),
      ).length,
      totalCount: cel.exerciseList.items.length,
    }));

    return res.status(200).json(result);
  }

  return res.status(405).json({ error: "Método não permitido" });
}
