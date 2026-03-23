# Array/Matrix Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add grammar-configurable fixed or dynamic array/matrix support with declaration, indexed reads, indexed writes, type validation, and runtime execution.

**Architecture:** Extend the lexer and grammar configuration with `arrayMode`, then introduce array-aware symbol metadata in the parser so declarations and indexed expressions can be validated before emitting dedicated array IR instructions. Update the interpreter to store array runtime slots with mode-specific behavior: fixed arrays enforce bounds and never grow, while dynamic arrays grow on writes and error on missing reads.

**Tech Stack:** TypeScript, Vitest, existing lexer/parser/IR/interpreter pipeline in `src`

---

### Task 1: Add token and grammar configuration scaffolding

**Files:**
- Modify: `src/token/constants/symbols.ts`
- Modify: `src/token/mappings/symbols-tokens.ts`
- Modify: `src/token/TokenIterator.ts`
- Modify: `src/tests/tokens/index.spec.ts`
- Test: `src/tests/lexer/indentation-tokens.spec.ts`

**Step 1: Write the failing test**

Add assertions that `TOKENS.BY_DESCRIPTION` exposes bracket tokens and that the lexer can tokenize `[` and `]`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/tokens/index.spec.ts src/tests/lexer/indentation-tokens.spec.ts`
Expected: FAIL because bracket tokens are undefined and `[`/`]` are not scanned.

**Step 3: Write minimal implementation**

- Add `left_bracket` and `right_bracket` to `src/token/constants/symbols.ts`.
- Map `[` and `]` in `src/token/mappings/symbols-tokens.ts`.
- Extend `GrammarConfig` in `src/token/TokenIterator.ts` with `arrayMode?: "fixed" | "dynamic"`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/tokens/index.spec.ts src/tests/lexer/indentation-tokens.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/token/constants/symbols.ts src/token/mappings/symbols-tokens.ts src/token/TokenIterator.ts src/tests/tokens/index.spec.ts src/tests/lexer/indentation-tokens.spec.ts
git commit -m "feat: add array grammar scaffolding"
```

### Task 2: Introduce array-aware symbol descriptors

**Files:**
- Modify: `src/token/TokenIterator.ts`
- Modify: `src/grammar/syntax/typeStmt.ts`
- Test: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add a typed grammar test that expects a fixed declaration like `int matriz[3][3];` to compile in fixed mode and preserve array metadata for later use.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because the symbol table only supports scalar `ValueType`.

**Step 3: Write minimal implementation**

- Add scalar-vs-array symbol descriptor types in `src/token/TokenIterator.ts`.
- Keep expression typing compatible by preserving a scalar type alias for expression results.
- Add helper methods to declare and resolve full symbol descriptors while keeping function signatures scalar-only for now.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for the new metadata-focused case.

**Step 5: Commit**

```bash
git add src/token/TokenIterator.ts src/grammar/syntax/typeStmt.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: add array symbol descriptors"
```

### Task 3: Parse fixed array declarations

**Files:**
- Modify: `src/grammar/syntax/declarationStmt.ts`
- Modify: `src/grammar/syntax/stmt.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`
- Test: `src/tests/grammar/helpers.ts`

**Step 1: Write the failing test**

Add grammar tests for:

- `int matriz[3][3];` compiling in `{ typingMode: "typed", arrayMode: "fixed" }`
- `int lista[];` failing in fixed mode
- `int tabela[3][];` failing because mixed dimensions are forbidden

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because declaration parsing stops after the identifier.

**Step 3: Write minimal implementation**

- Parse one or more `[int-literal]` suffixes after identifiers in fixed mode.
- Reject empty dimensions and mixed dimension lists in fixed mode.
- Emit a dedicated placeholder IR declaration for arrays instead of scalar `DECLARE`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/grammar/syntax/declarationStmt.ts src/grammar/syntax/stmt.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: parse fixed array declarations"
```

### Task 4: Add array IR operations and fixed-array runtime declaration

**Files:**
- Modify: `src/interpreter/constants.ts`
- Modify: `src/ir/emitter.ts`
- Modify: `src/interpreter/index.ts`
- Modify: `src/interpreter/utils.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests that the compiled IR contains a dedicated array declaration op and that executing a program with `int matriz[2][2];` initializes without crashing.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because the IR and interpreter only understand scalar declarations.

**Step 3: Write minimal implementation**

- Extend `Instruction` op unions with array ops such as `DECLARE_ARRAY`, `ARRAY_GET`, and `ARRAY_SET`.
- Implement fixed-array declaration handling in the interpreter using nested JS arrays plus metadata.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/interpreter/constants.ts src/ir/emitter.ts src/interpreter/index.ts src/interpreter/utils.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: add fixed array declarations to ir and runtime"
```

### Task 5: Parse indexed expressions for reads

**Files:**
- Modify: `src/grammar/syntax/factorStmt.ts`
- Modify: `src/grammar/syntax/exprStmt.ts`
- Modify: `src/token/TokenIterator.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- `print(matriz[1][1]);`
- using `matriz[1][1]` in arithmetic or return expressions
- rejection of partial access like `matriz[1]`

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because factor parsing treats identifiers as scalar values only.

**Step 3: Write minimal implementation**

- Parse repeated bracket suffixes after identifiers in `factorStmt`.
- Validate index count against declared dimensions.
- Validate index expression types as integer-compatible.
- Emit `ARRAY_GET` into a temp and return the base scalar type as the expression type.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/grammar/syntax/factorStmt.ts src/grammar/syntax/exprStmt.ts src/token/TokenIterator.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: support array element reads"
```

### Task 6: Parse indexed assignment targets for fixed arrays

**Files:**
- Modify: `src/grammar/syntax/attributeStmt.ts`
- Modify: `src/token/TokenIterator.ts`
- Modify: `src/interpreter/index.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- `matriz[1][2] = 7;`
- type mismatch when assigning `"x"` into `int matriz[2][2];`
- out-of-bounds write raising runtime error

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because assignment only accepts identifier targets and runtime lacks array write support.

**Step 3: Write minimal implementation**

- Generalize assignment target parsing to plain variables or fully indexed array elements.
- Emit `ARRAY_SET` for indexed writes.
- Add fixed-array bounds checks in runtime writes.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/grammar/syntax/attributeStmt.ts src/token/TokenIterator.ts src/interpreter/index.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: support fixed array writes"
```

### Task 7: Add dynamic typed array declarations and runtime growth

**Files:**
- Modify: `src/grammar/syntax/declarationStmt.ts`
- Modify: `src/token/TokenIterator.ts`
- Modify: `src/interpreter/index.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- `int lista[];` compiling in `{ typingMode: "typed", arrayMode: "dynamic" }`
- `lista[4] = 10;` auto-growing at runtime
- `int matriz[3][3];` failing in dynamic mode

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because only fixed declarations are recognized.

**Step 3: Write minimal implementation**

- Parse one or more empty dimensions `[]` when `arrayMode` is `dynamic`.
- Reject any explicit sizes in dynamic mode.
- Implement dynamic array declaration and indexed write growth in the interpreter.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/grammar/syntax/declarationStmt.ts src/token/TokenIterator.ts src/interpreter/index.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: add dynamic typed arrays"
```

### Task 8: Add untyped dynamic declaration syntax

**Files:**
- Modify: `src/grammar/syntax/declarationStmt.ts`
- Modify: `src/grammar/syntax/stmt.ts`
- Modify: `src/tests/grammar/typing-mode.spec.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add tests for:

- `lista[] = [];` compiling in `{ typingMode: "untyped", arrayMode: "dynamic" }`
- `lista[] = [];` failing when `arrayMode` is `fixed`

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because untyped declarations currently only support `variavel`.

**Step 3: Write minimal implementation**

- Teach untyped declaration parsing to recognize `identifier[] = []` as a dynamic array declaration.
- Register the symbol as a dynamic array with base type `dynamic`.
- Emit the dynamic array declaration/init IR.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/grammar/syntax/declarationStmt.ts src/grammar/syntax/stmt.ts src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: add untyped dynamic array declarations"
```

### Task 9: Add runtime read validation and regression coverage

**Files:**
- Modify: `src/interpreter/index.ts`
- Modify: `src/interpreter/runtime-error.ts`
- Modify: `src/i18n/locales/en/interpreter.ts`
- Modify: `src/i18n/locales/pt-BR/interpreter.ts`
- Modify: `src/i18n/locales/pt-PT/interpreter.ts`
- Modify: `src/i18n/locales/es/interpreter.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing test**

Add runtime tests for:

- fixed array read out of bounds
- dynamic array read from missing position
- multidimensional dynamic write then read
- bool/string arrays preserving value types

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because runtime errors and value handling are incomplete.

**Step 3: Write minimal implementation**

- Add runtime errors for invalid reads.
- Localize the new interpreter error messages.
- Ensure array element values are coerced using the existing scalar rules when stored into typed arrays.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/interpreter/index.ts src/interpreter/runtime-error.ts src/i18n/locales/en/interpreter.ts src/i18n/locales/pt-BR/interpreter.ts src/i18n/locales/pt-PT/interpreter.ts src/i18n/locales/es/interpreter.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "test: cover array runtime validation"
```

### Task 10: Run targeted and full verification

**Files:**
- Test: `src/tests/tokens/index.spec.ts`
- Test: `src/tests/lexer/indentation-tokens.spec.ts`
- Test: `src/tests/grammar/typing-mode.spec.ts`
- Test: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Run targeted suite**

Run: `npm test -- src/tests/tokens/index.spec.ts src/tests/lexer/indentation-tokens.spec.ts src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 2: Run full suite**

Run: `npm test`
Expected: PASS

**Step 3: Commit verification-only metadata if needed**

If any snapshots or golden outputs changed legitimately, stage them.

**Step 4: Final commit**

```bash
git add src
git commit -m "feat: add fixed and dynamic array support"
```
