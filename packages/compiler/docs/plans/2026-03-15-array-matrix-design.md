# Array/Matrix Support Design

**Date:** 2026-03-15

**Goal:** Add C-style array and matrix support to the compiler, covering typed fixed-size arrays and grammar-configurable dynamic arrays, including declaration, indexed read, indexed write, and expression usage across as many dimensions as the grammar mode allows.

## Scope

- Support typed fixed arrays in typed mode, such as `int matriz[3][3];`.
- Support typed dynamic arrays in typed mode, such as `int lista[];` and `int matriz[][];`.
- Support dynamic arrays in untyped mode with `lista[] = [];`.
- Support indexed reads and writes, such as `matriz[1][2] = 7;` and `print(matriz[1][2]);`.
- Support arbitrary dimensions within the selected array grammar mode.
- Add runtime bounds errors for fixed arrays.
- Add JS-like automatic growth on indexed writes for dynamic arrays.

## Out of Scope

- Mixed fixed/dynamic dimensions in the same declaration, such as `int tabela[3][];`.
- Array literals beyond the empty dynamic initializer `[]`.
- Partial indexing that returns a subarray, such as `matriz[1]` for a 2D array.
- C pointer semantics, pointer arithmetic, or memory aliasing behavior.

## Grammar Configuration

Add a new grammar option alongside the existing grammar settings:

- `arrayMode: "fixed" | "dynamic"`

This option behaves like `semicolonMode` and `typingMode`, controlling which array declaration forms are valid in the configured language variant.

### `arrayMode: "fixed"`

- Accept only arrays with explicit sizes in every dimension.
- Examples:
  - `int vetor[10];`
  - `int matriz[3][3];`
- Reject:
  - `int lista[];`
  - `lista[] = [];`
- Runtime behavior:
  - arrays never grow
  - out-of-bounds read/write raises runtime error

### `arrayMode: "dynamic"`

- Accept only arrays with empty dimensions.
- Examples:
  - `int lista[];`
  - `int matriz[][];`
  - in untyped mode: `lista[] = [];`
- Reject:
  - `int vetor[10];`
  - `int matriz[3][3];`
- Runtime behavior:
  - indexed writes may grow the array automatically
  - indexed reads on missing positions raise runtime error

## Surface Syntax

### Typed Mode

- Fixed mode:
  - `int matriz[3][3];`
  - `matriz[1][2] = 7;`
  - `print(matriz[1][2]);`
- Dynamic mode:
  - `int lista[];`
  - `int matriz[][];`
  - `lista[4] = 10;`

### Untyped Mode

- Dynamic mode only:
  - `lista[] = [];`
  - `lista[0] = 1;`
  - `print(lista[0]);`

Untyped mode plus `arrayMode: "fixed"` does not introduce fixed array declarations in this design.

## Semantic Rules

- Arrays are first-class declared variables with array metadata in the symbol table.
- The number of indexes used in an access must exactly match the declared number of dimensions.
- Every index expression must be of type `int`, or be accepted by the existing int-compatibility rules if such coercion already exists.
- Array element reads produce the array base type.
- Array element writes must be type-compatible with the array base type.
- In fixed mode, every declared dimension size must be a compile-time integer literal greater than zero.
- In dynamic mode, declarations may only use empty dimensions `[]`.
- Empty dynamic initialization with `[]` is only valid for dynamic arrays.

## Compiler Architecture

### Symbol Model

The current scalar-only `ValueType` handling is not enough to represent arrays cleanly. Introduce a richer variable descriptor for declared symbols.

Suggested shape:

```ts
type ScalarType = "int" | "float" | "string" | "bool" | "void" | "dynamic" | "unknown";

type SymbolDescriptor =
  | { kind: "scalar"; type: ScalarType }
  | {
      kind: "array";
      baseType: ScalarType;
      dimensions: number;
      arrayMode: "fixed" | "dynamic";
      sizes: number[];
    };
```

Rules:

- `sizes` is populated only for fixed arrays.
- `dimensions` is always the exact declared dimension count.
- Expression typing for `a[i][j]` resolves to the `baseType`.

### Parser Changes

Update declaration parsing to recognize array suffixes after identifiers.

- Fixed mode declarations parse one or more `[int-literal]`.
- Dynamic mode declarations parse one or more `[]`.
- Reject any declaration form that does not match the configured `arrayMode`.
- In untyped dynamic mode, parse `identifier[] = []` as a declaration form for a dynamic `dynamic` array.

Update factor parsing and assignment parsing to support indexed access.

- `factorStmt` should parse repeated postfix indexing after identifiers.
- Assignment logic must accept array element targets, not only plain identifiers.
- Function arguments and print expressions should accept indexed element expressions with no special-case handling once expression parsing supports them.

### Intermediate Representation

Add explicit array instructions instead of overloading the current scalar operations.

Suggested IR operations:

- `DECLARE_ARRAY`
- `ARRAY_GET`
- `ARRAY_SET`
- optionally `ARRAY_INIT` for explicit dynamic empty creation if it improves runtime clarity

Examples:

- `DECLARE_ARRAY matriz, int, [3,3]`
- `ARRAY_GET t1, matriz, [i,j]`
- `ARRAY_SET matriz, [i,j], valor`

Exact operand encoding can follow the project's current `Instruction` structure, but the IR should preserve:

- array variable name
- list of indexes
- fixed sizes when declaring fixed arrays
- base element type

### Runtime Model

Runtime slots must be extended to store arrays and their metadata.

Fixed arrays:

- initialize full nested storage based on declared sizes
- check bounds on every indexed read and write
- never auto-expand

Dynamic arrays:

- initialize as empty nested JS arrays
- on write, create/grow nested arrays as needed along the indexed path
- on read, if any indexed path segment is missing, raise runtime error

This preserves the requested mixed behavior:

- fixed arrays stay C-like
- dynamic arrays grow JS-like on write

## Error Handling

Compile-time errors:

- array declaration shape invalid for configured `arrayMode`
- fixed array dimension missing size
- dynamic array dimension contains a size
- non-integer fixed dimension size
- invalid untyped array declaration outside dynamic mode
- wrong number of indexes in read/write
- writing incompatible value type into typed array
- using non-array value with index syntax

Runtime errors:

- out-of-bounds access on fixed array
- reading a non-existing position from a dynamic array
- indexing into an uninitialized/non-array nested value if runtime state becomes inconsistent

## Testing Strategy

### Lexer

- tokenize `[` and `]`

### Grammar

- fixed typed declarations in fixed mode
- dynamic typed declarations in dynamic mode
- untyped `lista[] = []` in dynamic mode
- multidimensional indexed reads and writes
- rejection of fixed declarations in dynamic mode
- rejection of dynamic declarations in fixed mode
- rejection of mixed dimensions
- rejection of partial indexing

### Type Semantics

- assigning `int`, `float`, `string`, and `bool` array elements with compatible and incompatible values
- index expressions requiring integer-compatible types
- correct inferred type when array element is used in expressions, returns, arguments, and print

### Runtime

- fixed array read/write within bounds
- fixed array out-of-bounds read/write
- dynamic array write auto-growth
- dynamic array read after successful write
- dynamic array read from missing position errors
- multiple dimensions in both modes

## Recommended Delivery Strategy

Implement in small vertical slices:

1. Lexer plus grammar config scaffolding for `arrayMode`
2. Fixed array declaration plus metadata
3. Indexed reads/writes for fixed arrays
4. Dynamic declarations and runtime growth
5. Untyped `lista[] = []`
6. Cross-cutting validation and regression coverage
