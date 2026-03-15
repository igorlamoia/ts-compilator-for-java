# Bool Support Design

**Date:** 2026-03-15

**Goal:** Add Java-like `bool` support to the compiler so the language accepts `bool` declarations, parameters, returns, and the literals `true` and `false`.

## Scope

- Add `bool` as a first-class type anywhere value types are currently supported.
- Accept `true` and `false` as boolean literals.
- Keep runtime boolean values as actual booleans.
- Preserve existing condition execution behavior unless strict type checks naturally fit the current implementation.

## Design

### Lexer and Tokens

- Add `bool` to reserved type keywords.
- Add `true` and `false` as reserved boolean literals so they are tokenized consistently.

### Grammar and Semantic Typing

- Extend `ValueType` usage so `bool` is accepted in declarations, function parameters, and function return types.
- Update `typeStmt` to parse `bool`.
- Ensure literal inference returns `bool` for `true` and `false`.
- Ensure logical expressions return `bool`.
- Ensure relational expressions continue to return `bool`.
- Keep arithmetic restricted to numeric types.

### IR and Runtime

- Reuse existing instruction forms.
- Store `bool` variables in runtime slots with type `bool`.
- Coerce assigned and returned values for `bool` slots to JavaScript booleans.

### Tests

- Add lexer coverage for `bool`, `true`, and `false`.
- Add grammar and runtime coverage for:
  - `bool` variable declaration and assignment
  - boolean function parameter and return value
  - printing `true` and `false`
  - boolean expressions in control flow

## Out of Scope

- Broad Java-style rejection of non-boolean `if` and `while` conditions unless current semantics already support that cleanly.
