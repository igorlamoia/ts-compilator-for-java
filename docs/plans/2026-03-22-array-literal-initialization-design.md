# Array Literal Initialization Design

**Date:** 2026-03-22

**Goal:** Add declaration-time array and matrix population using bracket literals with mandatory commas, while keeping array literals invalid outside declarations.

## Scope

- Support declaration-time array literal initialization in typed mode.
- Support declaration-time array literal initialization in untyped mode.
- Use `[]` as the literal delimiter syntax.
- Require commas between elements and nested rows.
- Keep array literals invalid in later assignments and general expressions.

## Out of Scope

- Array literal assignment after declaration, such as `vetor = [0, 1];`
- Partial array literal updates, such as assigning one nested row literal into an existing matrix
- Non-declaration expression forms that evaluate to arrays
- C-style brace literals using `{}`

## Surface Syntax

### Typed Mode

- Fixed arrays:
  - `int vetor[2] = [0, 1];`
  - `int matriz[2][2] = [[0, 1], [2, 3]];`
- Dynamic arrays:
  - `int vetor[] = [0, 1];`
  - `int matriz[][] = [[0, 1], [2, 3]];`

Typed mode only allows these forms when the declaration itself is valid for the active grammar configuration.

### Untyped Mode

- `vetor[] = [0, 1];`
- `matriz[][] = [[0, 1], [2, 3]];`

Untyped mode always allows declaration-time array literal population.

### Invalid Examples

- `vetor = [0, 1];`
- `matriz = [[0, 1], [2, 3]];`
- `int matriz[2][2] = [[0, 1] [2, 3]];`

## Semantics

- Array literals are only valid immediately after a declaration target and `=`.
- Literal nesting depth must match the declared number of dimensions.
- In fixed array mode, each literal dimension length must exactly match the declared size.
- In dynamic array mode, the declaration still defines the number of dimensions, while the literal provides the populated contents.
- In typed mode, every literal leaf value must be compatible with the declared base type.
- In untyped mode, literal leaf values may follow the existing dynamic typing behavior, but the declaration-side dimensions must still match the literal depth.

## Parser Design

The existing parser already routes declaration syntax through dedicated declaration handlers. The new array literal parser should only be reachable from declaration parsing so that later assignments remain invalid by construction.

### Declaration Flow

1. Parse the declared array target exactly as today.
2. If `=` follows, parse a recursive array literal only when the declaration target is an array.
3. Reject array literals from all non-declaration contexts.

### Array Literal Parser

The parser should:

- consume `[` to begin a literal
- parse one or more elements separated by commas
- allow each element to be either:
  - a scalar expression for the leaf dimension
  - another nested array literal
- require `]` to end the literal

This produces a nested representation that can be validated against the declaration metadata.

## Validation

Compile-time validation should enforce:

- literal depth equals declared dimensions
- fixed array sizes match the literal shape exactly
- typed element values are assignment-compatible with the declared base type
- commas are present between sibling elements and rows
- nested shapes are structurally consistent
- array literals do not appear outside declaration parsing

## IR and Runtime

The change should reuse the current array runtime support instead of introducing a separate array-literal runtime format.

### Recommended IR Strategy

Emit:

1. `DECLARE_ARRAY`
2. one `ARRAY_SET` per populated leaf element

This keeps initialization semantics aligned with current indexed writes and minimizes interpreter changes.

Example lowering:

`int matriz[2][2] = [[0, 1], [2, 3]];`

becomes conceptually:

- `DECLARE_ARRAY matriz, int, [2,2]`
- `ARRAY_SET matriz, [0,0], 0`
- `ARRAY_SET matriz, [0,1], 1`
- `ARRAY_SET matriz, [1,0], 2`
- `ARRAY_SET matriz, [1,1], 3`

## Error Handling

Compile-time errors:

- array literal used outside declaration
- missing comma between elements
- wrong literal nesting depth
- fixed-size shape mismatch
- incompatible typed element value
- malformed nested row structure

Runtime behavior should continue to use the current array read/write logic once the declaration-time initialization has been lowered into existing array instructions.

## Testing Strategy

### Grammar and Semantics

- accept `int vetor[2] = [0, 1];`
- accept `int matriz[2][2] = [[0, 1], [2, 3]];`
- accept `vetor[] = [0, 1];` in untyped mode
- reject `vetor = [0, 1];`
- reject missing commas such as `[[0,1] [2,3]]`
- reject wrong fixed-size shape such as `int vetor[2] = [0, 1, 2];`
- reject wrong dimension depth such as `int matriz[2][2] = [0, 1];`
- reject typed mismatches such as `int vetor[2] = [0, "x"];`

### Runtime

- verify initialized values are readable immediately after declaration
- verify nested matrix values are stored in the expected positions
