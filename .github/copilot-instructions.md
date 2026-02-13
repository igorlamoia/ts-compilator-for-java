# Copilot Instructions - TypeScript Compiler for Java--

## Project Overview

This is a **monorepo compiler project** that implements a lexer, parser, and interpreter for Java-- (a simplified subset of Java). The project has two main packages:
- `packages/compiler`: Core compiler implementation (lexer → parser → intermediate code → interpreter)
- `packages/ide`: Next.js-based web IDE with Monaco editor integration

## Architecture & Data Flow

### Compiler Pipeline (packages/compiler/src/)
1. **Lexer** (`lexer/index.ts`) → Scans source code character-by-character into tokens
   - Uses scanner pattern: `LexerScanner` classes in `lexer/scanners/` (comment, string, number, identifier, symbol-and-operator)
   - Tracks line/column positions for error reporting
   - Factory pattern: `LexerScannerFactory.getInstance()` creates appropriate scanner

2. **Token Iterator** (`token/TokenIterator.ts`) → Wraps tokens with navigation methods
   - Provides `peek()`, `next()`, `consume()`, `match()` for recursive descent parsing
   - Holds `Emitter` instance for generating intermediate code

3. **Parser** (`grammar/syntax/`) → Recursive descent parser with one file per grammar rule
   - Entry point: `function-call.ts` (expects `main()` function structure)
   - Each syntax file corresponds to a grammar production (e.g., `stmt.ts`, `forStmt.ts`, `ifStmt.ts`)
   - See `grammar/ast/README.md` for complete grammar specification

4. **IR Emitter** (`ir/emitter.ts`) → Generates three-address code instructions
   - Creates temporary variables (`__temp0`, `__temp1`, ...)
   - Creates labels (`__label0`, `__label1`, ...)
   - Emits `Instruction[]` with ops: `+`, `-`, `*`, `/`, `==`, `IF`, `JUMP`, `CALL`, `DECLARE`, etc.

5. **Interpreter** (`interpreter/index.ts`) → Executes intermediate code
   - Two-pass: collects labels, then executes instructions
   - Maintains variable state and instruction pointer
   - Handles I/O through injected `stdout`/`stdin` callbacks

### IDE Integration (packages/ide/src/)
- **Monaco Editor**: `components/editor.tsx` + `contexts/EditorContext.tsx`
- **Compiler API Routes**: `pages/api/lexer.ts`, `pages/api/intermediator.ts`
  - `/api/lexer` → POST source code → returns tokens
  - `/api/intermediator` → POST tokens → returns intermediate instructions
- **Terminal**: `components/terminal/` uses `xterm.js` to run interpreter with I/O
- **Module transpilation**: `next-transpile-modules` configured in `next.config.ts` to import compiler package

## Key Conventions

### Error Handling
- **Custom issues system** (not standard Error): `IssueError`, `IssueWarning`, `IssueInfo` in `issue/`
- `IssueError` extends `Error` and includes `details: IssueDetails` with line/column/type
- Lexer collects warnings/infos without throwing, parser throws `IssueError`

### Token System
- Tokens stored as numeric constants in `token/constants/index.ts`
- Structure: `TOKENS.SYMBOLS`, `TOKENS.OPERATORS`, `TOKENS.RESERVEDS`, `TOKENS.LITERALS`
- Token class: `{ type: number, lexeme: string, line: number, column: number }`

### Grammar Implementation Pattern
Each grammar rule file exports a function that:
1. Takes `TokenIterator` as parameter
2. Calls `emitter.emit()` to generate intermediate code
3. Recursively calls other grammar functions
4. Example pattern from `attributeStmt.ts`:
   ```typescript
   export function attributeStmt(iterator: TokenIterator) {
     const ident = iterator.consume(TOKENS.LITERALS.identifier);
     iterator.consume(TOKENS.OPERATORS.assignment);
     const expr = exprStmt(iterator); // recursive call
     iterator.emitter.emit('=', ident.lexeme, expr, null);
   }
   ```

### Testing Pattern (Vitest)
- Tests in `packages/compiler/src/tests/` organized by feature (lexer, tokens)
- Lexer tests verify token scanning for specific language features (strings, numbers, comments)
- Run tests: `cd packages/compiler && npm run test`

## Developer Workflows

### Running the Compiler Standalone
```bash
cd packages/compiler
npm install
npm run start  # Compiles src/resource/input-code.java
```

### Running the IDE
```bash
cd packages/ide
npm install
npm run dev    # Starts on localhost:3000
```

### Testing
```bash
cd packages/compiler
npm run test   # Runs Vitest test suite
```

### Adding New Language Features
1. Add token constants to `token/constants/` if needed
2. Create lexer scanner in `lexer/scanners/` if new token pattern
3. Add grammar rule function in `grammar/syntax/`
4. Update `stmt.ts` or relevant dispatcher to call new rule
5. Add IR emission logic (call `iterator.emitter.emit()`)
6. Update interpreter in `interpreter/index.ts` if new operation type
7. Add tests in `tests/lexer/` or relevant test file

### Debugging Tips
- Source code for testing: edit `packages/compiler/src/resource/input-code.java`
- Lexer output: Check `tokens` array after `lexer.scanTokens()`
- Intermediate code: Logged in console from `index.ts` before interpreter runs
- Grammar reference: `packages/compiler/src/grammar/ast/README.md` has complete EBNF

## Project-Specific Knowledge

- **Java-- syntax**: Simplified Java with `scan()` and `print()` for I/O
- **Intermediate code format**: Three-address code (TAC) with instruction object: `{ op, result, operand1, operand2 }`
- **Monorepo**: Root `package.json` defines workspaces; IDE imports compiler via `@ts-compilator-for-java/compiler`
- **No AST construction**: Parser directly emits intermediate code (single-pass compilation)
- **Entry point requirement**: All programs must have `<type> main() { ... }` structure
