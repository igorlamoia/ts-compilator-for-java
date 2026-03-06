import { PrismaClient } from '@prisma/client'
import path from 'path'

const TEST_DB_PATH = path.resolve(__dirname, '../../../prisma/test.db')

export const prisma = new PrismaClient({
  datasources: { db: { url: `file:${TEST_DB_PATH}` } },
})

export async function clearDatabase() {
  await prisma.testCase.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.classMember.deleteMany()
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
  overrides: Partial<{ email: string; name: string; role: 'TEACHER' | 'STUDENT' | 'ADMIN' }> = {},
) {
  return prisma.user.create({
    data: {
      organizationId: orgId,
      email: `user-${Date.now()}-${Math.random()}@test.com`,
      name: 'Test User',
      role: 'STUDENT',
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
  classId: string,
  overrides: Partial<{ title: string; description: string; gradeWeight: number }> = {},
) {
  return prisma.exercise.create({
    data: {
      classId,
      title: 'Test Exercise',
      description: 'A test exercise',
      attachments: '',
      deadline: new Date(Date.now() + 86400000),
      gradeWeight: 10,
      ...overrides,
    },
  })
}

export function createSubmission(
  exerciseId: string,
  studentId: string,
  overrides: Partial<{ codeSnapshot: string; status: 'PENDING' | 'SUBMITTED' | 'GRADED' }> = {},
) {
  return prisma.submission.create({
    data: {
      exerciseId,
      studentId,
      codeSnapshot: 'int main() {}',
      status: 'PENDING',
      ...overrides,
    },
  })
}
