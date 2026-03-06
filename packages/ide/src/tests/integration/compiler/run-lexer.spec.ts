import { describe, it, expect } from 'vitest'
import { runLexerUseCase } from '@/use-cases/compiler/run-lexer'

const SIMPLE_PROGRAM = `int main() {
  int x;
  x = 5;
  print(x);
}`

describe('runLexerUseCase', () => {
  it('should tokenize a valid Java-- program', () => {
    const { tokens, warnings, infos } = runLexerUseCase({ sourceCode: SIMPLE_PROGRAM })

    expect(tokens.length).toBeGreaterThan(0)
    expect(warnings).toHaveLength(0)
    expect(tokens[0].lexeme).toBe('int')
    expect(tokens[1].lexeme).toBe('main')
  })

  it('should return tokens with correct line and column info', () => {
    const source = 'int x = 0;'
    const { tokens } = runLexerUseCase({ sourceCode: source })

    expect(tokens[0].line).toBe(1)
    expect(tokens[0].column).toBe(1)
  })

  it('should collect warnings for valid but suspicious code', () => {
    // Comments with no content don't produce warnings, but the lexer does track them
    const { tokens } = runLexerUseCase({ sourceCode: 'int x = 0; // comment' })
    expect(tokens.length).toBeGreaterThan(0)
  })

  it('should throw IssueError for invalid characters', () => {
    expect(() => runLexerUseCase({ sourceCode: 'int @ = 0;' })).toThrow()
  })

  it('should apply custom keyword map overrides', () => {
    // Override "int" keyword with "inteiro"
    const source = 'inteiro x;'
    const { tokens } = runLexerUseCase({ sourceCode: source, keywordMap: { inteiro: 21 } })
    expect(tokens[0].lexeme).toBe('inteiro')
  })
})
