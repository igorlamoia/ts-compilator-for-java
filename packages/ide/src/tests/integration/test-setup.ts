import { beforeEach, afterAll } from 'vitest'
import { prisma, clearDatabase } from './helpers'

beforeEach(async () => {
  await clearDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})
