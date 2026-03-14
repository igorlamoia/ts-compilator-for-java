import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const organizations = [
  { id: 'c1b2e3f4-a5b6-4c7d-8e9f-a0b1c2d3e4f5', name: 'CEFET-MG' },
  { id: 'd2c3f4a5-b6c7-4d8e-9f0a-b1c2d3e4f5a6', name: 'UFJF' },
]

const PROFESSOR_ID = 'e3d4a5b6-c7d8-4e9f-af1b-c2d3e4f5a6b7'
const ALUNO_ID = 'f4e5b6c7-d8e9-4f0a-b02c-d3e4f5a6b7c8'
const CEFET_ORG_ID = 'c1b2e3f4-a5b6-4c7d-8e9f-a0b1c2d3e4f5'

async function main() {
  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: { name: org.name },
      create: { id: org.id, name: org.name },
    })
  }

  const professorPassword = await hash('professor', 10)
  await prisma.user.upsert({
    where: { email: 'professor@gmail.com' },
    update: { password: professorPassword },
    create: {
      id: PROFESSOR_ID,
      email: 'professor@gmail.com',
      password: professorPassword,
      name: 'Professor',
      role: 'TEACHER',
      organizationId: CEFET_ORG_ID,
    },
  })

  const alunoPassword = await hash('aluno', 10)
  await prisma.user.upsert({
    where: { email: 'aluno@gmail.com' },
    update: { password: alunoPassword },
    create: {
      id: ALUNO_ID,
      email: 'aluno@gmail.com',
      password: alunoPassword,
      name: 'Aluno',
      role: 'STUDENT',
      organizationId: CEFET_ORG_ID,
    },
  })

  console.log('Seed completed: organizations, professor and aluno inserted.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
