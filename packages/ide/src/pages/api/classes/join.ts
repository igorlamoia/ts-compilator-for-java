import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { joinClassUseCase } from '@/use-cases/classes/join'
import { HttpError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' })

  const userId = req.headers['x-user-id'] as string || 'default-user-id'

  try {
    const result = await joinClassUseCase(prisma, { userId, accessCode: req.body.accessCode })
    return res.status(200).json({ success: true, classId: result.classId })
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
    console.error(error)
    return res.status(500).json({ error: 'Falha ao entrar na turma' })
  }
}
