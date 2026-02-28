import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Using a manual header or a default ID for testing
    const userId = req.headers['x-user-id'] as string || 'default-user-id'
    const orgId = req.headers['x-org-id'] as string || 'default-org-id'

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    // Handle GET - return classes for user
    if (req.method === 'GET') {
        let classes;
        if (orgId) {
            // Organization scope -> return classes for this tenant
            classes = await prisma.class.findMany({
                where: { organizationId: orgId },
                include: { teacher: true, _count: { select: { members: true, exercises: true } } }
            })
        } else {
            // Personal scope -> return classes the student joined
            classes = await prisma.class.findMany({
                where: {
                    members: {
                        some: { studentId: userId }
                    }
                },
                include: { teacher: true }
            })
        }
        return res.status(200).json(classes)
    }

    // Handle POST - create a class (requires orgId)
    if (req.method === 'POST') {
        if (!orgId) {
            return res.status(403).json({ error: 'Must be in an organization to create classes' })
        }

        const { name, description, accessCode } = req.body

        // Ensure Organization exists in DB
        await prisma.organization.upsert({
            where: { id: orgId },
            create: { id: orgId, name: 'Organization' },
            update: {}
        })

        // Ensure User exists in DB
        await prisma.user.upsert({
            where: { id: userId },
            create: { id: userId, organizationId: orgId, email: `teacher-${userId}@temp.com`, name: 'Teacher', role: 'TEACHER' },
            update: {}
        })

        const newClass = await prisma.class.create({
            data: {
                organizationId: orgId,
                teacherId: userId,
                name,
                description,
                accessCode
            }
        })

        return res.status(201).json(newClass)
    }

    return res.status(405).json({ error: 'Method not allowed' })
}
