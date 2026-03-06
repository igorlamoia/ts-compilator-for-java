# Optional Semicolons (JS-like ASI) Design

## Summary
Add JS-like optional semicolon behavior for statement termination in the compiler grammar. A statement can end with `;` or a valid line break. Existing code with explicit semicolons remains valid.

This design intentionally keeps `for` header separators mandatory (`for (init; cond; step)`) and applies JS-like `return` behavior where a newline immediately after `return` is treated as `return;`.

## Goals
- Allow `;` at end of command lines to be optional.
- Keep explicit `;` fully supported.
- Preserve compatibility for current programs.
- Make behavior predictable and testable.

## Non-Goals
- Changing expression grammar precedence.
- Relaxing `for (...)` internal separators.
- Introducing source-to-source rewriting/preprocessing.

## Chosen Approach
### Recommended Approach (Chosen)
Emit explicit `NEWLINE` tokens in lexer and implement parser-level ASI-style terminator rules.

Reasoning:
- Clear, explicit control of line boundaries.
- Better diagnostics and maintainability than inferred-line heuristics.
- Lower risk than preprocessing that rewrites source and shifts error locations.

### Alternatives Considered
1. Infer line breaks from token `line` metadata only.
- Fewer lexer changes.
- Fragile around comments/blank lines and harder to reason about.

2. Preprocess source and auto-insert semicolons before lexing.
- Parser changes might be smaller.
- Debugging and error mapping get harder.

## Architecture
- Lexer emits `NEWLINE` tokens instead of discarding `\n`.
- Parser centralizes statement termination in a helper (`consumeStmtTerminator`).
- Terminator accepted as:
1. explicit `;`, or
2. one or more `NEWLINE`, or
3. boundary token (`}` or end-of-stream).
- `for (...)` keeps strict internal semicolons.
- `return` special case: immediate newline/boundary after `return` means `return;`.

## Component Changes
### Lexer
- File: `packages/compiler/src/lexer/index.ts`
- Stop early-return on `\n`; emit `TOKENS.SYMBOLS.newline` token.
- Keep current string scanning behavior so newline escape sequences inside string literals are not statement terminators.

### Token Constants and Mapping
- Files:
  - `packages/compiler/src/token/constants/symbols.ts`
  - `packages/compiler/src/token/mappings/symbols-tokens.ts` (if needed for consistency)
- Add `newline` token type and lexeme handling for diagnostics/debug consistency.

### Grammar Helper
- New helper file (proposed): `packages/compiler/src/grammar/syntax/terminator.ts`
- Functions:
  - `skipNewlines(iterator)`
  - `consumeStmtTerminator(iterator, options?)`

### Grammar Rules to Update
Replace direct `consume(semicolon)` in statement-ending contexts with the helper:
- `declarationStmt.ts`
- `ioStmt.ts`
- `returnStmt.ts` (with ASI return rule)
- `breakStmt.ts`
- `continueStmt.ts`
- `stmt.ts` variants (assignment, postfix/prefix increment, function-call statement)

Keep strict semicolons in:
- `forStmt.ts` header separators.

### Statement List Handling
- `listStmt` and/or `stmt` should consume repeated `NEWLINE` as empty lines so blank lines do not create syntax errors.

## Data Flow
1. Source is tokenized, including `NEWLINE` tokens.
2. Statement parsers parse core statement content.
3. Statement parsers call `consumeStmtTerminator()`.
4. `returnStmt` checks next token right after `return`:
- newline/boundary => emit `RETURN null`.
- otherwise parse expression then consume terminator.
5. Newlines inside grouped expression contexts do not terminate statements.

## Error Handling Policy
- Missing same-line terminator before next statement token still errors.
- `for` header missing semicolons still errors at exact position.
- `return` newline follows JS-like behavior intentionally (no error; expression becomes next statement).
- Multiple blank lines are tolerated.

## Testing Strategy
Add/extend tests in `packages/compiler/src/tests`:
1. Optional semicolon success for declaration/assignment/IO/return/break/continue/function-call statements.
2. Mixed style (`;` and newline terminators in same block).
3. `return` newline behavior (`return` then newline then expression).
4. Multiline expressions/calls inside `(...)` do not terminate early.
5. `for(...)` remains strict with required semicolons.
6. Blank-line tolerance.
7. Regression: existing semicolon-based tests still pass.

## Impact Analysis
### Parser Impact
Medium: many statement rules currently consume semicolon directly and must migrate to a shared terminator helper.

### Lexer Impact
Low-to-medium: newline currently ignored, so token stream shape changes and some parser/test paths must account for `NEWLINE`.

### IR/Runtime Impact
Low: semantics of already-valid code unchanged. New behavior primarily affects parsing boundaries and `return` ASI semantics.

### Developer Experience
Positive: language becomes more ergonomic and closer to JS expectations; style can mix `;` and line breaks.

### Risks
- Edge cases around newline handling near grouping and comments.
- Accidental ambiguity if helper is not used consistently across statement rules.

### Mitigations
- Single terminator helper used everywhere.
- Focused tests for edge cases and regressions.

## Rollout Notes
- Keep feature behavior default (no opt-in flag) since user requirement is language-level.
- Update grammar docs (`grammar/ast/README.md`) after implementation to reflect optional terminators.
