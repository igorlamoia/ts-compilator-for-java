# Scan Assignable Target Design

**Goal:** Allow `scan` to write directly to any valid assignable target, including indexed array and matrix elements, so code like `scan(int, matriz[i][j]);` works without an auxiliary variable.

## Context

Today `scan` only accepts a plain identifier as destination. Array and matrix support already exists for indexed reads and writes, so users can currently work around the limitation by scanning into a temporary scalar and then assigning that scalar to `matriz[i][j]`.

The requested change is to make `scan` accept any valid lvalue already supported by assignment semantics, in both `typed` and `untyped` grammar modes.

## Scope

In scope:
- `scan(int, x);`
- `scan(int, vetor[i]);`
- `scan(int, matriz[i][j]);`
- `scan("%d", matriz[i][j]);`
- `scan(x);` in untyped mode
- `scan(vetor[i]);` and `scan(matriz[i][j]);` in untyped mode

Out of scope:
- New runtime `SCAN` instruction variants
- Supporting non-assignable expressions such as `scan(x + 1)` or `scan(foo())`
- Relaxing existing assignment rules for partial indexed access

## Options Considered

### Option 1: Reuse assignment-target parsing in `scan`

Parse the `scan` destination with the same target parser used by assignment statements. If the target is scalar, keep emitting the existing `CALL/SCAN` instruction. If the target is not scalar, lower the statement into:
1. read into a typed temporary with `CALL/SCAN`
2. emit the normal assignment/write logic for the parsed target

Pros:
- Reuses existing lvalue validation
- Keeps the interpreter contract stable
- Minimizes duplicated semantics

Cons:
- `scanStmt` becomes slightly more semantic than before

### Option 2: Add a dedicated IR instruction for scanned writes

Emit a new instruction such as `SCAN_SET` that performs input and final write in one step.

Pros:
- Avoids temporary variables in generated IR

Cons:
- Pushes assignment semantics into the interpreter
- Adds more runtime surface area and duplication

### Option 3: Introduce a higher-level scan expression/value model

Treat scan as producing a value and lower `scan(..., target)` through a more explicit AST-level rewrite.

Pros:
- Conceptually clean in a compiler with a richer AST

Cons:
- Does not fit the current parser/IR architecture
- Highest implementation cost for little benefit

## Decision

Choose Option 1.

The compiler already has a clear split where parsing and semantic validation happen before IR reaches the interpreter. Reusing assignment-target parsing keeps lvalue rules centralized and avoids inventing new runtime behavior for `scan`.

## Design

### Grammar and parsing

`scanStmt` should stop consuming only a bare identifier and instead parse an `AssignmentTarget`.

The accepted target set becomes the same as normal assignment:
- scalar identifier
- fully indexed array or matrix element

The following must remain invalid:
- partial indexed access like `matriz[i]` when the symbol has more dimensions
- arbitrary expressions such as `x + 1`
- function calls or other non-lvalues

### Type and semantic behavior

Typed mode:
- Preserve the current hint parsing rules: `int`, `float`, `"%d"`, `"%f"`
- For scalar targets, preserve existing lossy-conversion warnings
- For indexed array targets, validate using the resolved element type, not the array container descriptor

Untyped mode:
- Accept any valid assignable target with no hint argument
- Use the same lowering strategy as typed mode
- Preserve current runtime-driven value behavior while still enforcing that the destination is a valid lvalue

### IR generation

Scalar target:
- Keep current emission: `("CALL", "SCAN", hint, targetName)`

Non-scalar target:
- Create a temporary
- Register the temporary with the destination element type when known
- Emit `("CALL", "SCAN", hint, temp)`
- Reuse assignment emission for the parsed target so array/matrix destinations continue to lower to `ARRAY_SET`

This keeps the interpreter unchanged for `SCAN`: it still writes only to a scalar slot name.

### Error handling

Prefer existing grammar errors rather than introducing new messages.

Expected outcomes:
- `scan(int, matriz[i])` for a 2D matrix should fail using the same invalid-target rule used by assignment
- `scan(int, foo())` should fail as non-assignable syntax
- `scan(int, matriz[i][j])` should compile and execute

### Testing

Add tests for:
- typed scalar regression: existing scalar `scan` behavior still works
- typed indexed targets: vector and matrix element destinations compile and run
- untyped indexed targets: vector and matrix element destinations compile and run
- invalid partial access: `scan(..., matriz[i])` remains rejected
- invalid non-lvalue destination: expression/function-call style targets remain rejected

## Risks

- If `scanStmt` partially duplicates assignment emission instead of reusing it, scalar and indexed writes can drift semantically over time.
- If the temporary is not registered with the correct type, typed-mode warnings and downstream assumptions may become inconsistent.

## Success Criteria

- Users can write `scan(int, matriz[i][j]);` with no auxiliary variable.
- The same direct-write behavior works in untyped mode for valid indexed targets.
- Existing scalar `scan` programs continue to compile and run unchanged.
- Invalid destinations fail with the current assignment-style validation rules.
