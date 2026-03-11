import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { listOrganizationsUseCase } from '@/use-cases/organizations/list'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo nao permitido' })
  }

  const organizations = await listOrganizationsUseCase(prisma)
  return res.status(200).json(organizations)
}
