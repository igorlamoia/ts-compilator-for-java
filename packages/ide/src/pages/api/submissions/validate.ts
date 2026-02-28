import type { NextApiRequest, NextApiResponse } from 'next'
import { Lexer } from '@ts-compilator-for-java/compiler/src/lexer'
import { TokenIterator } from '@ts-compilator-for-java/compiler/token/TokenIterator'
import { IssueError } from '@ts-compilator-for-java/compiler/issue'
import prisma from '@/lib/prisma'

export type TValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
    submissionId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TValidationResult>) {
    if (req.method !== 'POST') return res.status(405).json({ valid: false, errors: ['Method not allowed'], warnings: [] })

    const userId = req.headers['x-user-id'] as string
    if (!userId) return res.status(401).json({ valid: false, errors: ['Não autorizado'], warnings: [] })

    const { exerciseId, sourceCode } = req.body
    if (!exerciseId || !sourceCode) {
        return res.status(400).json({ valid: false, errors: ['Código e exercício são obrigatórios'], warnings: [] })
    }

    const errors: string[] = []
    const warnings: string[] = []

    // Step 1: Lexical Analysis
    try {
        const lexer = new Lexer(sourceCode)
        const tokens = lexer.scanTokens()

        if (lexer.warnings.length > 0) {
            lexer.warnings.forEach(w => warnings.push(`Aviso (linha ${w.line}): ${w.message}`))
        }

        // Step 2: Intermediate Code Generation (Syntax + Semantic)
        try {
            const iterator = new TokenIterator(tokens)
            iterator.generateIntermediateCode()
        } catch (error) {
            if (error instanceof IssueError) {
                errors.push(`Erro de compilação (linha ${error.details.line}): ${error.details.message}`)
            } else {
                errors.push(`Erro de compilação: ${(error as Error).message}`)
            }
        }
    } catch (error) {
        if (error instanceof IssueError) {
            errors.push(`Erro léxico (linha ${error.details.line}): ${error.details.message}`)
        } else {
            errors.push(`Erro léxico: ${(error as Error).message}`)
        }
    }

    // If there are compilation errors, return them without saving
    if (errors.length > 0) {
        return res.status(200).json({ valid: false, errors, warnings })
    }

    // Step 3: Code compiles! Create the submission
    try {
        const submission = await prisma.submission.create({
            data: {
                exerciseId,
                studentId: userId,
                codeSnapshot: sourceCode,
                status: 'SUBMITTED'
            }
        })

        return res.status(200).json({
            valid: true,
            errors: [],
            warnings,
            submissionId: submission.id
        })
    } catch (error) {
        return res.status(500).json({
            valid: false,
            errors: ['Erro ao salvar a submissão no banco de dados'],
            warnings
        })
    }
}
