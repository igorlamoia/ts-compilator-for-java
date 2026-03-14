import { describe, it, expect } from 'vitest'
import { runLexerUseCase } from '@/use-cases/compiler/run-lexer'
import { runIntermediatorUseCase } from '@/use-cases/compiler/run-intermediator'

function compile(sourceCode: string) {
  const { tokens } = runLexerUseCase({ sourceCode })
  return runIntermediatorUseCase({ tokens })
}

describe('runIntermediatorUseCase', () => {
  it('should generate instructions for a simple program', () => {
    const instructions = compile(`int main() {
  int x;
  x = 5;
}`)

    expect(instructions.length).toBeGreaterThan(0)
  })

  it('should generate assignment instruction', () => {
    const instructions = compile(`int main() {
  int x;
  x = 42;
}`)

    const assignInstructions = instructions.filter((i: any) => i.op === '=')
    expect(assignInstructions.length).toBeGreaterThan(0)
  })

  it('should generate label and jump instructions for if/else', () => {
    const instructions = compile(`int main() {
  int x;
  x = 1;
  if (x > 0) {
    x = 2;
  }
}`)

    const labels = instructions.filter((i: any) => i.op === 'LABEL')
    const jumps = instructions.filter((i: any) => i.op === 'JUMP' || i.op === 'IF')
    expect(labels.length).toBeGreaterThan(0)
    expect(jumps.length).toBeGreaterThan(0)
  })

  it('should throw IssueError for syntactically invalid code', () => {
    expect(() => compile(`int main() { int = ; }`)).toThrow()
  })
})
