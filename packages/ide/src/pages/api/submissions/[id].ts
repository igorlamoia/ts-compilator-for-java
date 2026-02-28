import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.headers['x-user-id'] as string
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.query
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing submission id' })

    // GET - fetch single submission with exercise info
    if (req.method === 'GET') {
        const submission = await prisma.submission.findUnique({
            where: { id },
            include: {
                student: { select: { id: true, name: true, email: true } },
                exercise: {
                    select: { id: true, title: true, description: true, gradeWeight: true, classId: true },
                }
            }
        })

        if (!submission) return res.status(404).json({ error: 'Submission not found' })
        return res.status(200).json(submission)
    }

    // PATCH - grade a submission (teacher only)
    if (req.method === 'PATCH') {
        const { score, teacherFeedback } = req.body

        const submission = await prisma.submission.update({
            where: { id },
            data: {
                score: score !== undefined ? Number(score) : undefined,
                teacherFeedback: teacherFeedback || undefined,
                status: 'GRADED'
            }
        })

        return res.status(200).json(submission)
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
