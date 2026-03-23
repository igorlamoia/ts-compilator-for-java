# Scan Assignable Target Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow `scan` to write directly to any valid assignable target, including vector and matrix elements, in both typed and untyped grammar modes.

**Architecture:** Reuse the existing assignment-target parser so `scanStmt` accepts the same lvalues as normal assignment. Keep the runtime `SCAN` contract unchanged by lowering non-scalar scan destinations into `SCAN -> temp` followed by the existing assignment emission path. Preserve current scalar behavior, warnings, and invalid-target failures.

**Tech Stack:** TypeScript, Vitest, existing parser/IR/interpreter pipeline

---

### Task 1: Add failing grammar coverage for typed indexed scan targets

**Files:**
- Modify: `src/tests/grammar/typing-mode.spec.ts`
- Test: `src/tests/grammar/typing-mode.spec.ts`

**Step 1: Write the failing test**

```ts
it("accepts typed scan syntax with indexed assignable targets", () => {
  expect(() =>
    compileToIr(
      `
        int main() {
          int vetor[3];
          int matriz[2][2];
          scan(int, vetor[1]);
          scan("%d", matriz[1][1]);
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    ),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts`
Expected: FAIL near `scan(..., vetor[1])` or `scan(..., matriz[1][1])`

**Step 3: Write minimal implementation**

Update `src/grammar/syntax/ioStmt.ts` so `scanStmt` parses the destination as an assignment target instead of consuming only `IDENT`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS for the new typed indexed-scan test

**Step 5: Commit**

```bash
git add src/tests/grammar/typing-mode.spec.ts src/grammar/syntax/ioStmt.ts
git commit -m "test: cover typed scan assignable targets"
```

### Task 2: Add failing grammar coverage for untyped indexed scan targets

**Files:**
- Modify: `src/tests/grammar/typing-mode.spec.ts`
- Test: `src/tests/grammar/typing-mode.spec.ts`

**Step 1: Write the failing test**

```ts
it("accepts bare scan syntax with indexed assignable targets in untyped mode", () => {
  expect(() =>
    compileToIr(
      `
        funcao main() {
          lista[][] = [];
          scan(lista[1][2]);
        }
      `,
      { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
    ),
  ).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts`
Expected: FAIL because untyped `scan` still expects a bare identifier

**Step 3: Write minimal implementation**

Extend the same `scanStmt` change so untyped mode also accepts parsed assignment targets and not only scalar identifiers.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS for both typed and untyped indexed-scan coverage

**Step 5: Commit**

```bash
git add src/tests/grammar/typing-mode.spec.ts src/grammar/syntax/ioStmt.ts
git commit -m "feat: accept indexed scan targets in untyped mode"
```

### Task 3: Add failing semantic coverage for invalid scan targets

**Files:**
- Modify: `src/tests/grammar/type-semantics.spec.ts`
- Test: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing tests**

```ts
it("rejects partial indexed scan targets", () => {
  expect(() =>
    compileToIr(
      `
        int main() {
          int matriz[2][2];
          scan(int, matriz[1]);
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    ),
  ).toThrow();
});

it("rejects non-assignable scan targets", () => {
  expect(() =>
    compileToIr(
      `
        int main() {
          int x = 0;
          scan(int, x + 1);
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    ),
  ).toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: At least one new case fails because current parsing does not go through the shared lvalue rules

**Step 3: Write minimal implementation**

Refactor `src/grammar/syntax/ioStmt.ts` to reuse `parseAssignmentTarget` and shared assignment validation so invalid scan targets fail through the existing assignment-target path.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for invalid partial and non-lvalue scan targets

**Step 5: Commit**

```bash
git add src/tests/grammar/type-semantics.spec.ts src/grammar/syntax/ioStmt.ts
git commit -m "feat: validate scan targets as assignable lvalues"
```

### Task 4: Lower non-scalar scan targets through temporary values

**Files:**
- Modify: `src/grammar/syntax/ioStmt.ts`
- Modify: `src/grammar/syntax/attributeStmt.ts`
- Test: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing tests**

```ts
it("warns when a float scan hint writes into an int array element", () => {
  const result = compileProgram(`
    int main() {
      int matriz[2][2];
      scan(float, matriz[1][1]);
      return 0;
    }
  `, {
    grammar: { typingMode: "typed", arrayMode: "fixed" },
  });

  expect(result.warnings).toHaveLength(1);
});

it("emits array write ir for indexed scan targets", () => {
  const instructions = compileToIr(`
    int main() {
      int matriz[2][2];
      scan(int, matriz[1][1]);
      return 0;
    }
  `, {
    grammar: { typingMode: "typed", arrayMode: "fixed" },
  });

  expect(instructions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ op: "CALL", result: "SCAN", operand1: "int" }),
      expect.objectContaining({ op: "ARRAY_SET", result: "matriz" }),
    ]),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because indexed scan targets still do not lower through a temporary plus array write

**Step 3: Write minimal implementation**

Implement lowering in `src/grammar/syntax/ioStmt.ts`:
- parse the scan target
- if scalar, keep the current `CALL/SCAN`
- if non-scalar, allocate a temp, register its type, emit `CALL/SCAN` into the temp, then emit the existing assignment logic for that target using the temp as source

Export and reuse only the smallest assignment helper needed from `src/grammar/syntax/attributeStmt.ts` instead of duplicating array-write logic.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for indexed scan IR and warning coverage

**Step 5: Commit**

```bash
git add src/grammar/syntax/ioStmt.ts src/grammar/syntax/attributeStmt.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: lower indexed scan targets through assignments"
```

### Task 5: Add runtime regression coverage for direct vector and matrix scan writes

**Files:**
- Modify: `src/tests/grammar/type-semantics.spec.ts`
- Test: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Write the failing tests**

```ts
it("reads directly into fixed matrix elements at runtime", async () => {
  const result = await executeProgram(
    `
      int main() {
        int matriz[2][2];
        scan(int, matriz[0][0]);
        scan(int, matriz[0][1]);
        print(matriz[0][0]);
        print(matriz[0][1]);
      }
    `,
    {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
      stdin: createStdin(["4", "7"]),
    },
  );

  expect(result.output).toBe("47");
});

it("reads directly into dynamic matrix elements at runtime in untyped mode", async () => {
  const result = await executeProgram(
    `
      funcao main() {
        lista[][] = [];
        scan(lista[1][2]);
        print(lista[1][2]);
      }
    `,
    {
      grammar: { typingMode: "untyped", arrayMode: "dynamic" },
      stdin: createStdin(["9"]),
    },
  );

  expect(result.output).toBe("9");
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: FAIL because runtime-reachable scan-to-array lowering is incomplete

**Step 3: Write minimal implementation**

Complete any missing temp registration or assignment reuse needed so both fixed typed and dynamic untyped indexed scan targets execute correctly.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS for direct runtime scan writes

**Step 5: Commit**

```bash
git add src/tests/grammar/type-semantics.spec.ts src/grammar/syntax/ioStmt.ts src/grammar/syntax/attributeStmt.ts
git commit -m "test: cover runtime scan writes to indexed targets"
```

### Task 6: Run focused verification and final full test sweep

**Files:**
- Modify: `src/grammar/syntax/ioStmt.ts`
- Modify: `src/grammar/syntax/attributeStmt.ts`
- Modify: `src/tests/grammar/typing-mode.spec.ts`
- Modify: `src/tests/grammar/type-semantics.spec.ts`

**Step 1: Run focused grammar tests**

Run: `npm test -- src/tests/grammar/typing-mode.spec.ts`
Expected: PASS

**Step 2: Run focused semantic/runtime tests**

Run: `npm test -- src/tests/grammar/type-semantics.spec.ts`
Expected: PASS

**Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS with no regressions

**Step 4: Review diff**

Run: `git diff -- src/grammar/syntax/ioStmt.ts src/grammar/syntax/attributeStmt.ts src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts`
Expected: Only scan-target parsing/lowering and test coverage changes

**Step 5: Commit**

```bash
git add src/grammar/syntax/ioStmt.ts src/grammar/syntax/attributeStmt.ts src/tests/grammar/typing-mode.spec.ts src/tests/grammar/type-semantics.spec.ts
git commit -m "feat: support scan writes to assignable targets"
```
