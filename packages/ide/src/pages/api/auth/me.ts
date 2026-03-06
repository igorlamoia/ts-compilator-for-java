import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getMeUseCase } from '@/use-cases/auth/me'
import { NotFoundError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const user = await getMeUseCase(prisma, userId)
    return res.status(200).json(user)
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message })
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
