import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getMeUseCase } from '@/use-cases/auth/me'
import { HttpError } from '@/lib/errors'
import { toUserDTO } from '@/dtos/user.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo nao permitido' })

  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(401).json({ error: 'Nao autorizado' })

  try {
    const user = await getMeUseCase(prisma, userId)
    return res.status(200).json(toUserDTO(user))
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
    console.error(error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
