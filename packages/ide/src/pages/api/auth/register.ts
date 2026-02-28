import prisma from '../../../lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' })
        }

        // A real app would hash the password, but keeping it simple for dev
        // We will create a default organization for the user for this simple manual setup

        let org = await prisma.organization.findFirst({
            where: { name: 'Default Organization' }
        });

        if (!org) {
            org = await prisma.organization.create({
                data: { name: 'Default Organization' }
            });
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                role: role.toUpperCase() === 'TEACHER' ? 'TEACHER' : 'STUDENT',
                organizationId: org.id
            }
        })

        return res.status(201).json({
            message: 'Account created successfully',
            user: newUser
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Failed to create user' })
    }
}
