import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/lib/errors'

export async function getSubmissionUseCase(prisma: PrismaClient, id: string) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      exercise: { select: { id: true, title: true, description: true } },
      publication: { select: { totalGrade: true, deadline: true, minRequired: true } },
    },
  })

  if (!submission) throw new NotFoundError('Submissao nao encontrada')
  return submission
}
