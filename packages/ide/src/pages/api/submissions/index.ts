import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.headers['x-user-id'] as string || 'default-user-id'
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    if (req.method === 'POST') {
        const { exerciseId, codeSnapshot, status } = req.body

        const submission = await prisma.submission.create({
            data: {
                exerciseId,
                studentId: userId,
                codeSnapshot,
                status: status || 'PENDING'
            }
        })
        return res.status(201).json(submission)
    }

    // GET submissions for teacher view
    if (req.method === 'GET') {
        const { exerciseId } = req.query
        if (!exerciseId || typeof exerciseId !== 'string') return res.status(400).json({ error: 'Missing exerciseId' })

        const submissions = await prisma.submission.findMany({
            where: { exerciseId },
            include: { student: true }
        })
        return res.status(200).json(submissions)
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
