import { PrismaClient } from '@prisma/client'

interface GetClassMembersRequest {
  classId: string;
  userId: string;
}

export async function getClassMembersUseCase(prisma: PrismaClient, req: GetClassMembersRequest) {
  const { classId, userId } = req;

  // Verify class exists and grab the teacher
  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        }
      }
    }
  });

  if (!classObj) {
    throw new Error('Turma não encontrada.');
  }

  // Verify user exists and belongs to the same organization as the class
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  // Any user in the same organization can view class members
  // (the dashboard already shows all org classes to students)
  if (user.organizationId !== classObj.organizationId) {
    throw new Error('Acesso negado.');
  }

  // Fetch all students (ClassMember) for this class
  const classMembers = await prisma.classMember.findMany({
    where: { classId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
        }
      }
    },
    orderBy: {
      student: { name: 'asc' }
    }
  });

  // Calculate some simple progress metrics based on Submissions matching the Class
  const totalExercises = await prisma.classExerciseList.count({
    where: { classId }
  }); // Note: we can also count actual distinct exercises but ClassExerciseList gives us the lists published to the class. Let's get total unique exercises across all lists in this class.

  const exercisesInClass = await prisma.classExerciseList.findMany({
    where: { classId },
    include: {
      exerciseList: {
        include: {
          items: true
        }
      }
    }
  });

  let maxExercises = 0;
  exercisesInClass.forEach(cel => {
    maxExercises += cel.exerciseList.items.length;
  });

  // Calculate progress for each member
  const membersWithProgress = await Promise.all(classMembers.map(async (cm) => {
    const studentId = cm.studentId;
    const gradedSubmissionsCount = await prisma.submission.count({
      where: {
        classId,
        studentId,
        status: 'GRADED'
      }
    });

    return {
      ...cm.student,
      joinedAt: cm.joinedAt,
      progress: {
        completed: gradedSubmissionsCount,
        total: maxExercises,
        percentage: maxExercises > 0 ? Math.round((gradedSubmissionsCount / maxExercises) * 100) : 0
      }
    };
  }));

  return {
    teacher: classObj.teacher,
    members: membersWithProgress
  };
}
