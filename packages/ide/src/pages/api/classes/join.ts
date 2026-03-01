import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const userId = req.headers['x-user-id'] as string || 'default-user-id'
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const { accessCode } = req.body

    const cls = await prisma.class.findUnique({
        where: { accessCode }
    })

    if (!cls) return res.status(404).json({ error: 'Class not found' })

    // Ensure User exists in DB
    await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, organizationId: cls.organizationId, email: `student - ${userId} @temp.com`, name: 'Student', role: 'STUDENT' },
        update: {}
    })

    // Create membership
    await prisma.classMember.upsert({
        where: { classId_studentId: { classId: cls.id, studentId: userId } },
        create: { classId: cls.id, studentId: userId },
        update: {}
    })

    return res.status(200).json({ success: true, classId: cls.id })
}
