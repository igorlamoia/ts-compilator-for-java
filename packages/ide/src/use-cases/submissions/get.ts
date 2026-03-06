import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function getSubmissionUseCase(prisma: PrismaClient, id: string) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      exercise: {
        select: { id: true, title: true, description: true, gradeWeight: true, classId: true },
      },
    },
  })

  if (!submission) throw new NotFoundError('Submission not found')
  return submission
}
