import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const organizations = [
  { id: 'org-cefet-mg', name: 'CEFET-MG' },
  { id: 'org-ufjf', name: 'UFJF' },
]

async function main() {
  for (const org of organizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: { name: org.name },
      create: { id: org.id, name: org.name },
    })
  }
  console.log('Seed completed: organizations inserted.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
