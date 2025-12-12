# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based compiler and IDE for Java-- (a simplified version of Java). The project is organized as a monorepo with two main packages:
- **compiler**: Lexical analyzer, parser, intermediate code generator, and interpreter
- **ide**: Next.js-based web IDE with Monaco Editor integration

## Common Commands

### Compiler Package
```bash
cd packages/compiler

# Run the compiler on input-code.java
npm run start

# Build TypeScript to JavaScript
npm run build

# Run the built output
npm run run-build

# Run tests with Vitest
npm run test
```

### IDE Package
```bash
cd packages/ide

# Start Next.js development server (runs on localhost:3000)
npm install && npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint
```

### Root Commands
The root is a simple workspace manager. Install dependencies from the root or individual packages.

## Architecture

### Compiler Pipeline
The compiler follows a multi-stage architecture:

1. **Lexer** (`packages/compiler/src/lexer/`): Character-by-character tokenization
   - `Lexer` class scans source code and generates tokens
   - Scanner factory pattern (`scanners/factory.ts`) dispatches to specialized scanners:
     - `comment.ts`: Handles single-line (`//`) and multi-line (`/* */`) comments
     - `identifier.ts`: Scans identifiers and keywords
     - `number.ts`: Parses integer and float literals
     - `string.ts`: Processes string literals with escape sequences
     - `symbol-and-operator.ts`: Recognizes operators and symbols

2. **Token System** (`packages/compiler/src/token/`):
   - `Token` class represents lexical units with type, lexeme, line, and column
   - `TOKENS` constants define all token types (literals, operators, keywords, symbols)
   - `TokenIterator` wraps token array with parsing utilities (peek, next, consume, match)

3. **Parser/Grammar** (`packages/compiler/src/grammar/syntax/`):
   - Recursive descent parser with one file per grammar production
   - Each `*Stmt.ts` file corresponds to a non-terminal in the grammar
   - Entry point: `function-call.ts` (expects `<type> IDENT '(' ')' <block>`)
   - Grammar productions are documented in their respective files via `@derivation` comments

4. **Intermediate Code Generation** (`packages/compiler/src/ir/`):
   - `Emitter` class generates three-address code during parsing
   - Generates temporary variables (`__temp0`, `__temp1`, ...) and labels (`__label0`, `__label1`, ...)
   - Instructions include: arithmetic ops, logical ops, relational ops, assignments, jumps, labels, function calls

5. **Interpreter** (`packages/compiler/src/interpreter/`):
   - `Interpreter` class executes the intermediate code
   - Maintains symbol table (variables map), label table, and instruction pointer
   - Supports system calls: `PRINT` and `SCAN` for I/O
   - I/O operations are abstracted via `stdout`/`stdin` callbacks passed to constructor

### Data Flow
```
input-code.java → Lexer → Token[] → TokenIterator → Grammar/Parser (w/ Emitter) → Instruction[] → Interpreter → Output
```

### IDE Architecture
- **Monaco Editor Integration**: Custom language support for Java-- with syntax highlighting
- **API Routes** (`packages/ide/src/pages/api/`):
  - `/api/lexer`: Accepts source code, returns token analysis
  - `/api/intermediator`: Accepts source code, returns intermediate code instructions
- **Hooks**:
  - `useLexerAnalyse`: Handles lexical analysis requests
  - `useIntermediatorCode`: Handles intermediate code generation
  - `useEditor`: Manages Monaco Editor state and configuration
- The IDE imports the compiler package directly as a dependency

### Key Design Patterns
- **Scanner Factory Pattern**: `LexerScannerFactory.getInstance()` returns appropriate scanner based on character
- **Recursive Descent Parsing**: Each grammar rule is a function that calls other rule functions
- **Three-Address Code**: All intermediate instructions have at most one operator and three addresses
- **Iterator Pattern**: `TokenIterator` provides safe navigation through token stream

## Input Code Location
The compiler reads from `packages/compiler/src/resource/input-code.java` by default. Edit this file to test different Java-- programs.

## Testing
Tests are located in `packages/compiler/src/tests/`:
- `lexer/`: Tests for individual scanner components (comments, numbers, strings)
- `tokens/`: Tests for token classification

When adding new language features:
1. Add token definitions in `packages/compiler/src/token/constants/`
2. Create/update scanner in `packages/compiler/src/lexer/scanners/`
3. Add grammar production in `packages/compiler/src/grammar/syntax/`
4. Update emitter logic if new instruction types are needed
5. Update interpreter to handle new instruction types
6. Add test cases

## Issue Reporting
The codebase has an issue system (`packages/compiler/src/issue/`):
- `IssueError`: Compilation errors (thrown)
- `IssueWarning`: Non-fatal warnings (collected)
- `IssueInfo`: Informational messages
All issues track line and column position.

## Important Notes
- The language is called "Java--" (Java minus minus) - a simplified subset of Java
- Only single-parameter function declarations are currently supported: `<type> IDENT () { ... }`
- The interpreter is stack-less and uses direct variable lookup by name
- Labels are used for control flow (if/else, loops) instead of structured jumps
