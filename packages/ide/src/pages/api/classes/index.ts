import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { listClassesUseCase } from '@/use-cases/classes/list'
import { createClassUseCase } from '@/use-cases/classes/create'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string || 'default-user-id'
  const orgId = req.headers['x-org-id'] as string || 'default-org-id'

  if (req.method === 'GET') {
    const classes = await listClassesUseCase(prisma, orgId, userId)
    return res.status(200).json(classes)
  }

  if (req.method === 'POST') {
    const { name, description, accessCode } = req.body
    const newClass = await createClassUseCase(prisma, { orgId, userId, name, description, accessCode })
    return res.status(201).json(newClass)
  }

  return res.status(405).json({ error: 'Metodo nao permitido' })
}
