import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { loginUseCase } from '@/use-cases/auth/login'
import { HttpError } from '@/lib/errors'
import { toUserDTO } from '@/dtos/user.dto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' })

  try {
    const user = await loginUseCase(prisma, req.body)
    return res.status(200).json({ message: 'Login successful', user: toUserDTO(user) })
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.statusCode).json({ error: error.message })
    console.error(error)
    return res.status(500).json({ error: 'Falha ao realizar login' })
  }
}
