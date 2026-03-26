# Array Parameter Design

**Date:** 2026-03-25

**Goal:** Support passing arrays and matrices as function parameters by reference, with fixed-array signatures requiring exact sizes and dynamic-array signatures requiring only the number of dimensions.

## Scope

- Support scalar array and matrix parameters in typed function signatures.
- Pass array arguments by reference so callee writes are visible to the caller.
- Validate array arguments structurally during function calls.
- Preserve the distinction between fixed and dynamic arrays in function signatures.

## Out of Scope

- Array-valued expressions beyond identifiers used as call arguments.
- Copy-by-value semantics for arrays.
- Partial array descriptors such as C-style `int vec[][4]`.
- New implicit conversions between array and scalar values.

## Surface Syntax

### Fixed Array Mode

- Parameter declarations must include all dimension sizes.
- Example:

```c
void printaProPai(int vec[2][4]) {
  print(vec[0][0]);
}
```

- Calls are valid only when the argument array has:
  - the same base type
  - the same number of dimensions
  - exactly the same declared sizes

### Dynamic Array Mode

- Parameter declarations must encode only the number of dimensions.
- Example:

```c
void printaProPai(int vec[][]) {
  print(vec[0][0]);
}
```

- Calls are valid only when the argument array has:
  - the same base type
  - the same number of dimensions

Concrete runtime sizes do not participate in dynamic-mode call validation.

## Semantics

- Arrays are passed by reference.
- Reassigning an element inside the callee updates the caller-visible array.
- An identifier used as a full array argument remains an array value.
- An indexed access such as `vec[i][j]` remains a scalar expression and cannot satisfy an array parameter.

## Approach Selection

### 1. Recommended: Typed parameter descriptors with structural argument validation

- Extend function signatures so each parameter stores either a scalar descriptor or an array descriptor.
- Compare array arguments against parameter descriptors during parsing/semantic validation of function calls.
- Reuse the existing runtime array value object for by-reference passing.

Why this is recommended:

- Preserves the requested distinction between fixed and dynamic arrays.
- Keeps validation precise and predictable.
- Fits the existing symbol-descriptor model already used for variables.

### 2. Grammar-only syntax support

- Accept array syntax in parameters but keep signatures internally coarse.

Trade-off:

- Smaller short-term change.
- Weakens compatibility checks and creates misleading syntax.

### 3. Normalize all array parameters to a generic runtime-only reference type

- Treat fixed and dynamic signatures as nearly identical after parsing.

Trade-off:

- Simplifies execution.
- Loses semantic precision that the language rules require.

Chosen approach: **Option 1**

## Compiler Architecture

### Function Signature Model

The current function signature model stores parameter types as scalar `ValueType[]`. That is not sufficient for array parameters. The new model should store full parameter descriptors:

- scalar parameter:
  - `type`
- array parameter:
  - `baseType`
  - `dimensions`
  - `arrayMode`
  - `sizes`

For fixed arrays, `sizes` contains every declared dimension size.
For dynamic arrays, `sizes` is empty and `dimensions` defines the expected rank.

### Parameter Parsing

The parameter parser should accept:

- scalar:
  - `int x`
- fixed array:
  - `int vec[2][4]`
- dynamic array:
  - `int vec[][]`

Mode-specific restrictions:

- `fixed`: reject empty dimensions in parameter declarations
- `dynamic`: reject sized dimensions in parameter declarations

### Function Call Validation

When parsing a call:

- if the parameter is scalar, keep the current scalar compatibility behavior
- if the parameter is array:
  - require the argument expression to resolve to an array identifier
  - require matching base type
  - require matching dimension count
  - in `fixed`, require exact size equality for every dimension

Reject:

- scalar passed to array parameter
- array passed to scalar parameter
- base type mismatch
- dimension count mismatch
- fixed-size mismatch

## Runtime Design

The interpreter already stores arrays as structured runtime values. Passing by reference should reuse the same runtime array object instead of cloning it.

Recommended runtime behavior:

1. Evaluate call arguments in the caller scope.
2. If an evaluated argument is an array runtime value, preserve the original object reference.
3. When the callee declares its parameter slot, initialize it with that same runtime value.

This preserves shared mutation naturally:

```c
void zeraPrimeiro(int vec[2][4]) {
  vec[0][0] = 0;
}
```

After `zeraPrimeiro(vec)`, the caller sees `vec[0][0] == 0`.

## Error Handling

Compile-time errors:

- fixed-mode parameter declared with `[]`
- dynamic-mode parameter declared with `[N]`
- scalar argument passed to array parameter
- array argument passed to scalar parameter
- mismatched base type
- mismatched number of dimensions
- mismatched fixed sizes

Runtime behavior should not introduce copies or special array-parameter coercions.

## Testing Strategy

### Grammar and Semantic Validation

- accept `void f(int vec[2][4])` in fixed mode
- reject `void f(int vec[][])` in fixed mode
- accept `void f(int vec[][])` in dynamic mode
- reject `void f(int vec[2][4])` in dynamic mode
- accept `f(vec)` when fixed signature exactly matches declared array shape
- reject `f(vec)` when fixed signature sizes differ
- accept `f(vec)` in dynamic mode when dimension count matches
- reject `f(vec)` in dynamic mode when dimension count differs
- reject `f(vec[0][0])` when `f` expects an array parameter

### Runtime

- verify that a callee can read matrix values through an array parameter
- verify that a callee write such as `vec[0][0] = 99` is visible in the caller after return
- verify fixed and dynamic array parameters behave identically with respect to reference semantics

## Success Criteria

- Function signatures can describe array parameters precisely.
- Fixed array parameters require exact declared sizes.
- Dynamic array parameters validate only base type and dimension count.
- Array arguments are passed by reference, not copied.
- Incompatible array arguments fail during compilation.
