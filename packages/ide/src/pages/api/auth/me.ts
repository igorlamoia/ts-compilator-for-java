import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const userId = req.headers['x-user-id'] as string
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) return res.status(404).json({ error: 'User not found' })

        return res.status(200).json(user)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
