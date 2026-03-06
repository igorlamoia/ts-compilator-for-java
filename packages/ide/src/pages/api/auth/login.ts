import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { loginUseCase } from '@/use-cases/auth/login'
import { ValidationError, UnauthorizedError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const user = await loginUseCase(prisma, req.body)
    return res.status(200).json({ message: 'Login successful', user })
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message })
    if (error instanceof UnauthorizedError) return res.status(401).json({ error: error.message })
    console.error(error)
    return res.status(500).json({ error: 'Failed to login' })
  }
}
