import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'
import path from 'path'

const TEST_DB_PATH = path.resolve(__dirname, '../../../prisma/test.db')

export const prisma = new PrismaClient({
  datasources: { db: { url: `file:${TEST_DB_PATH}` } },
})

export async function clearDatabase() {
  await prisma.submission.deleteMany()
  await prisma.testCase.deleteMany()
  await prisma.exerciseListItem.deleteMany()
  await prisma.classExerciseList.deleteMany()
  await prisma.classMember.deleteMany()
  await prisma.exerciseList.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()
}

// --- Seed helpers ---
export function createOrg(name = 'Test Org') {
  return prisma.organization.create({ data: { name } })
}

export function createUser(
  orgId: string,
  overrides: Partial<{ email: string; name: string; role: 'TEACHER' | 'STUDENT' | 'ADMIN'; password: string }> = {},
) {
  return prisma.user.create({
    data: {
      organizationId: orgId,
      email: `user-${Date.now()}-${Math.random()}@test.com`,
      name: 'Test User',
      role: 'STUDENT',
      password: hashSync('password123', 4),
      ...overrides,
    },
  })
}

export function createClass(
  orgId: string,
  teacherId: string,
  overrides: Partial<{ name: string; description: string; accessCode: string }> = {},
) {
  return prisma.class.create({
    data: {
      organizationId: orgId,
      teacherId,
      name: 'Test Class',
      description: 'A test class',
      accessCode: `CODE-${Date.now()}-${Math.random()}`,
      ...overrides,
    },
  })
}

export function createExercise(
  teacherId: string,
  overrides: Partial<{ title: string; description: string }> = {},
) {
  return prisma.exercise.create({
    data: {
      teacherId,
      title: 'Test Exercise',
      description: 'A test exercise',
      attachments: '',
      ...overrides,
    },
  })
}

export function createExerciseList(
  teacherId: string,
  overrides: Partial<{ title: string; description: string }> = {},
) {
  return prisma.exerciseList.create({
    data: {
      teacherId,
      title: 'Test List',
      description: 'A test exercise list',
      ...overrides,
    },
  })
}

export function createExerciseListItem(
  exerciseListId: string,
  exerciseId: string,
  overrides: Partial<{ gradeWeight: number; orderIndex: number }> = {},
) {
  return prisma.exerciseListItem.create({
    data: {
      exerciseListId,
      exerciseId,
      gradeWeight: 10,
      orderIndex: 0,
      ...overrides,
    },
  })
}

export function createClassExerciseList(
  exerciseListId: string,
  classId: string,
  overrides: Partial<{ totalGrade: number; minRequired: number }> = {},
) {
  return prisma.classExerciseList.create({
    data: {
      exerciseListId,
      classId,
      totalGrade: 10,
      minRequired: 1,
      ...overrides,
    },
  })
}

export function createSubmission(
  exerciseId: string,
  studentId: string,
  exerciseListId: string,
  classId: string,
  overrides: Partial<{ codeSnapshot: string; status: 'PENDING' | 'SUBMITTED' | 'GRADED' }> = {},
) {
  return prisma.submission.create({
    data: {
      exerciseId,
      studentId,
      exerciseListId,
      classId,
      codeSnapshot: 'int main() {}',
      status: 'PENDING',
      ...overrides,
    },
  })
}
