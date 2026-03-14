import type { PrismaClient } from '@prisma/client'

export async function listClassesUseCase(prisma: PrismaClient, orgId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const include = {
    teacher: true,
    _count: { select: { members: true, exerciseLists: true } },
  } as const;

  // ADMIN sees all classes in the organization
  if (user.role === 'ADMIN') {
    return prisma.class.findMany({
      where: { organizationId: orgId },
      include,
    });
  }

  // TEACHER sees only classes they teach
  if (user.role === 'TEACHER') {
    return prisma.class.findMany({
      where: { organizationId: orgId, teacherId: userId },
      include,
    });
  }

  // STUDENT sees only classes they have joined (ClassMember)
  return prisma.class.findMany({
    where: {
      organizationId: orgId,
      members: { some: { studentId: userId } },
    },
    include,
  });
}
