import type { PrismaClient } from '@prisma/client'
import { Lexer } from '@ts-compilator-for-java/compiler/src/lexer'
import type { KeywordMap } from '@ts-compilator-for-java/compiler/src/lexer'
import { TokenIterator } from '@ts-compilator-for-java/compiler/token/TokenIterator'
import { IssueError } from '@ts-compilator-for-java/compiler/issue'
import { Interpreter } from '@ts-compilator-for-java/compiler/interpreter'
import type { Instruction } from '@ts-compilator-for-java/compiler/interpreter/constants'
import { buildEffectiveKeywordMap } from '@/lib/keyword-map'

export type TestCaseResult = {
  label: string
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
  submissionId?: string
  testCaseResults?: TestCaseResult[]
  testCasesPassed?: number
  testCasesTotal?: number
}

async function runTestCase(instructions: Instruction[], input: string, timeoutMs = 5000) {
  const inputLines = input.split('\n')
  let inputIndex = 0
  let output = ''

  const interpreter = new Interpreter(instructions, {
    stdout: (msg: string) => { output += msg },
    stdin: async () => inputLines[inputIndex++] ?? '',
  })

  try {
    await Promise.race([
      interpreter.execute(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)),
    ])
    return { output, error: null }
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return { output, error: 'Tempo limite excedido (5s)' }
    }
    return { output, error: (err as Error).message }
  }
}

function normalizeOutput(s: string) {
  return s.replace(/\r\n/g, '\n').trimEnd()
}

export async function validateSubmissionUseCase(
  prisma: PrismaClient,
  input: {
    exerciseId: string
    sourceCode: string
    userId: string
    keywordMap?: KeywordMap
    dryRun?: boolean
  },
): Promise<ValidationResult> {
  const { exerciseId, sourceCode, userId, keywordMap, dryRun } = input

  const errors: string[] = []
  const warnings: string[] = []
  let instructions: Instruction[] | null = null

  // Step 1: Lexical Analysis
  try {
    const effectiveKeywordMap = buildEffectiveKeywordMap(keywordMap)
    const lexer = new Lexer(sourceCode, effectiveKeywordMap)
    const tokens = lexer.scanTokens()

    lexer.warnings.forEach((w) => warnings.push(`Aviso (linha ${w.line}): ${w.message}`))

    // Step 2: Intermediate Code Generation
    try {
      const iterator = new TokenIterator(tokens)
      instructions = iterator.generateIntermediateCode()
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

  if (errors.length > 0) return { valid: false, errors, warnings }

  // Step 3: Run test cases
  let testCaseResults: TestCaseResult[] | undefined
  let testCasesPassed: number | undefined
  let testCasesTotal: number | undefined

  if (instructions) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { testCases: { orderBy: { orderIndex: 'asc' } } },
    })

    if (exercise?.testCases && exercise.testCases.length > 0) {
      testCaseResults = []
      testCasesTotal = exercise.testCases.length
      testCasesPassed = 0

      for (const tc of exercise.testCases) {
        const { output, error } = await runTestCase(instructions, tc.input)
        const actualOutput = error ? `[Erro] ${error}` : normalizeOutput(output)
        const passed = !error && actualOutput === normalizeOutput(tc.expectedOutput)
        if (passed) testCasesPassed++
        testCaseResults.push({
          label: tc.label || `Caso ${tc.orderIndex + 1}`,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: error ? `[Erro] ${error}` : output,
          passed,
        })
      }
    }
  }

  if (dryRun) {
    return { valid: true, errors: [], warnings, testCaseResults, testCasesPassed, testCasesTotal }
  }

  // Step 4: Save submission
  const submission = await prisma.submission.create({
    data: { exerciseId, studentId: userId, codeSnapshot: sourceCode, status: 'SUBMITTED' },
  })

  return {
    valid: true,
    errors: [],
    warnings,
    submissionId: submission.id,
    testCaseResults,
    testCasesPassed,
    testCasesTotal,
  }
}
