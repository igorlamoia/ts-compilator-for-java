import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.headers['x-user-id'] as string
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.query
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing exercise id' })

    if (req.method === 'GET') {
        const exercise = await prisma.exercise.findUnique({
            where: { id },
            include: {
                class: { select: { name: true, teacherId: true } },
                submissions: {
                    where: { studentId: userId },
                    orderBy: { submittedAt: 'desc' },
                    take: 1
                }
            }
        })

        if (!exercise) return res.status(404).json({ error: 'Exercise not found' })

        return res.status(200).json(exercise)
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
