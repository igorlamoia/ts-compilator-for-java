import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.headers['x-user-id'] as string || 'default-user-id'
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    if (req.method === 'GET') {
        const { classId } = req.query
        if (!classId || typeof classId !== 'string') return res.status(400).json({ error: 'Missing classId' })

        const exercises = await prisma.exercise.findMany({
            where: { classId },
            include: {
                submissions: {
                    where: { studentId: userId },
                    orderBy: { submittedAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                        score: true,
                        teacherFeedback: true,
                        submittedAt: true,
                    }
                }
            }
        })
        return res.status(200).json(exercises)
    }

    if (req.method === 'POST') {
        const { classId, title, description, deadline, gradeWeight } = req.body

        const exercise = await prisma.exercise.create({
            data: {
                classId,
                title,
                description,
                deadline: new Date(deadline),
                gradeWeight: Number(gradeWeight),
                attachments: ''
            }
        })
        return res.status(201).json(exercise)
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
