import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { registerUseCase } from '@/use-cases/auth/register'
import { ValidationError, ConflictError } from '@/lib/errors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const user = await registerUseCase(prisma, req.body)
    return res.status(201).json({ message: 'Account created successfully', user })
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message })
    if (error instanceof ConflictError) return res.status(400).json({ error: error.message })
    console.error(error)
    return res.status(500).json({ error: 'Failed to create user' })
  }
}
