# Configurable Block Delimiters Design

**Date:** 2026-03-06  
**Scope:** `packages/compiler`

## Goal
Allow block opening/closing delimiters to be configured as words through lexer config, while keeping `{` and `}` as default and always-supported delimiters.

## Requirements
- Replace hard dependency on literal braces for block syntax by tokenized delimiters.
- Keep compatibility with existing source code using `{` and `}`.
- Accept configured word delimiters in addition to braces.
- Apply to all block contexts (`<blockStmt>`, `switch` blocks, and statement-list termination).
- Keep token mapping-driven behavior aligned with existing reserved-word handling (like `switch`).

## Proposed Architecture
### 1. Lexer Config Extension
Introduce a config shape in lexer construction:
- `customKeywords?: KeywordMap` (existing capability)
- `blockDelimiters?: { open: string; close: string }` (new)

Effective `keywordMap` precedence:
1. Built-in `TOKENS.RESERVEDS`
2. User `customKeywords`
3. `blockDelimiters` aliases mapped to:
- `open -> TOKENS.SYMBOLS.left_brace`
- `close -> TOKENS.SYMBOLS.right_brace`

This keeps parser logic unchanged because parser already consumes token ids, not raw lexemes.

### 2. Tokenization Model
- Keep symbol mappings for `{` and `}` in `SYMBOLS_TOKENS_MAP`.
- Add word-delimiter support via keyword map resolution in identifier scanning.
- Result: both syntaxes can coexist in a single file.

### 3. Parser Impact
No semantic parser rewrites are required.
- `blockStmt` still consumes `left_brace` then `right_brace`.
- `switchStmt` still consumes `left_brace` and `right_brace` around case/default sections.
- `listStmt` still terminates on `right_brace`.
- `stmt` still dispatches block parsing on `left_brace`.

## Validation Rules
For `blockDelimiters`:
- Must be non-empty identifier-like words: `[A-Za-z_][A-Za-z0-9_]*`
- `open` and `close` must be different.
- Must not collide with built-in reserved words by default (e.g., `if`, `switch`, `for`, etc.).

Failure mode:
- Throw a clear constructor-time error in lexer config validation.

## Testing Strategy
### Unit Tests
- Lexer maps configured words to brace token ids.
- Validation rejects invalid delimiter definitions.

### Integration/Grammar Tests
- Program using only braces still parses.
- Program using configured words (e.g., `begin/end`) parses.
- Mixed-style source (brace + word delimiters) parses.
- `switch` block works with configured word delimiters.

## Documentation Updates
- Update `packages/compiler/src/grammar/ast/README.md` to clarify grammar consumes delimiter tokens (`left_brace` / `right_brace`) and these can originate from braces or configured words.

## Trade-offs and Decision
### Considered Alternatives
1. Parser-level alias handling (rejected): leaks lexical concerns into parser and is brittle.
2. Full delimiter abstraction layer (rejected): over-engineered for current needs.

### Selected Approach
Dual-mode lexer configuration (recommended): smallest safe change set with backward compatibility and clear extension point.

## Non-Goals
- Supporting non-word custom delimiters (symbols like `<<` / `>>`).
- Removing brace support.
- Changing expression/operator grammar.

## Success Criteria
- Existing brace-based programs run unchanged.
- Configured word delimiters are recognized as block tokens.
- All block contexts work consistently with either delimiter form.
- Tests cover validation + parser behavior regressions.
