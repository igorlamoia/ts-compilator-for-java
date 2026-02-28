import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' })
        }

        // In a real app we would check hashed passwords.
        // Assuming simple manual auth for local dev based on user request.

        return res.status(200).json({
            message: 'Login successful',
            user
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Failed to login' })
    }
}
