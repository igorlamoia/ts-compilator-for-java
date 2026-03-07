# Python-like Indentation Blocks Design

Date: 2026-03-07  
Package: `packages/compiler`  
Status: Approved

## Goal
Fix indentation-mode parsing so block syntax is consistently Python-like: blocks are introduced by `:` and structure is defined by indentation tokens, while semicolon behavior remains controlled by `semicolonMode`.

## Confirmed Requirements
1. In indentation mode, block owners must use `:` and indented bodies.
2. `switch` must support indentation blocks like all other block constructs.
3. In indentation mode, delimiter-based blocks are rejected everywhere (`{}`, configured `begin/end`).
4. Semicolon behavior is not coupled to indentation mode; it remains controlled by parser `semicolonMode`.

## Approach Chosen
Implement a mode-driven parser core with shared block helpers keyed by `blockMode` (`delimited` vs `indentation`) and migrate all block-owning grammar rules to use it.

Why this approach:
- Removes inconsistent parser behavior where brace paths still exist in indentation mode.
- Prevents duplicated logic across statement parsers.
- Scales cleanly for nested blocks, including `switch`/`case`/`default`.

## Architecture
### Shared block helper
Introduce a parser helper (conceptual API):
- `parseBlock(iterator, parseBody)`

Behavior:
- `delimited` mode:
  - consume `{`
  - parse body
  - consume `}`
- `indentation` mode:
  - consume `:`
  - consume `NEWLINE`
  - consume `INDENT`
  - parse body until block end
  - consume `DEDENT`

### Shared mode-aware terminator checks
Introduce helper(s) to identify block/section termination based on mode instead of hardcoded `}` checks.

## Syntax Contract
### Indentation mode
Block headers end with `:` and must be followed by `NEWLINE` and `INDENT`.

Applies to:
- function bodies
- `if` and `else`
- `while`
- `for`
- `switch`
- `case` / `default` section bodies

### Delimited mode
Current `{ ... }` behavior remains unchanged.

## Switch Design
### Delimited mode
Keep existing `switch (expr) { case ...: ... default: ... }` behavior.

### Indentation mode
Support:
- `switch (expr):`
- indented section headers: `case <literal>:` / `default:`
- each section body parsed by indentation boundaries

Section termination in indentation mode:
- next `case` or `default` at the switch section indentation level
- or dedent that exits the switch block

## Semicolon Policy
No indentation-specific override.

Statement termination continues to use existing `consumeStmtTerminator` behavior:
- `semicolonMode: "optional-eol"` allows omission at allowed boundaries.
- `semicolonMode: "required"` requires explicit `;`, including in indentation mode.

## Error Handling
### Parser-level
- missing `:` at block headers
- missing `NEWLINE` and/or `INDENT` after `:`
- malformed switch section structure in indentation mode

### Lexer-level (already enforced, must remain enforced)
- `{}` in indentation mode
- configured block delimiters (`begin/end`) in indentation mode
- indentation consistency failures (`unexpected_indent`, `invalid_dedent`, `inconsistent_indentation`)

## Testing Strategy
### Grammar success coverage
Add/extend tests to prove indentation-mode success for:
- function blocks
- `if/else`
- `while`
- `for`
- `switch` with `case` and `default`

### Grammar failure coverage
Add/extend tests for:
- missing `:` on each block owner
- missing `NEWLINE`/`INDENT` after `:`
- invalid indentation transitions in switch sections

### Semicolon interaction coverage
In indentation mode:
- `optional-eol` accepts EOL-terminated statements without `;`
- `required` rejects missing `;`

### Regression
Delimited mode suites remain green with no behavior changes.

## Out of Scope
- Changing the semicolon policy model.
- Adding new delimiter syntaxes in indentation mode.
- Altering lexer token model beyond integration needs.
