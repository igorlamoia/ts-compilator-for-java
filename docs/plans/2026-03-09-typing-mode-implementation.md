# Typing Mode (Typed/Untyped) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add strict grammar-level typing mode customization (`typed`/`untyped`) end-to-end across compiler, IDE config/customizer, and API propagation.

**Architecture:** Extend `GrammarConfig` with `typingMode` (default `typed`) and branch parser behavior for declarations and function signatures. In untyped mode, declarations/signatures require explicit declaration keywords (`variavel`, `funcao`) and parameters are identifier-only; explicit type tokens are rejected. IDE and API normalize/persist/forward the new mode consistently.

**Tech Stack:** TypeScript, Vitest, Next.js API routes, React Context, existing compiler lexer/parser/token iterator.

---

### Task 1: Define failing grammar tests for typing modes in compiler

**Files:**
- Create: `packages/compiler/src/tests/grammar/typing-mode.spec.ts`
- Modify: `packages/compiler/src/tests/grammar/helpers.ts` (if helper type needs `typingMode` exposure)
- Reference: `packages/compiler/src/token/TokenIterator.ts`, `packages/compiler/src/grammar/syntax/function-call.ts`, `packages/compiler/src/grammar/syntax/declarationStmt.ts`, `packages/compiler/src/grammar/syntax/parameterListStmt.ts`, `packages/compiler/src/grammar/syntax/stmt.ts`

**Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { compileToIr } from "./helpers";

describe("Grammar Typing Mode", () => {
  it("accepts typed declarations/functions in typed mode", () => {
    const source = `
      int soma(int a, int b) { return a + b; }
      int main() { int x = 1; return soma(x, 2); }
    `;
    expect(() =>
      compileToIr(source, { grammar: { typingMode: "typed" } }),
    ).not.toThrow();
  });

  it("accepts untyped declarations/functions in untyped mode", () => {
    const source = `
      funcao soma(a, b) { return a + b; }
      funcao main() { variavel x = 1; return soma(x, 2); }
    `;
    expect(() =>
      compileToIr(source, { grammar: { typingMode: "untyped" } }),
    ).not.toThrow();
  });

  it("rejects typed function signature in untyped mode", () => {
    expect(() =>
      compileToIr(`int main(){ return 1; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|statement/i);
  });

  it("rejects typed variable declaration in untyped mode", () => {
    expect(() =>
      compileToIr(`funcao main(){ int x = 1; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|statement/i);
  });

  it("rejects typed parameters in untyped mode", () => {
    expect(() =>
      compileToIr(`funcao soma(int a){ return a; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|parameter/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
Expected: FAIL on unimplemented `typingMode` behavior.

**Step 3: Commit test-only baseline**

```bash
git add packages/compiler/src/tests/grammar/typing-mode.spec.ts packages/compiler/src/tests/grammar/helpers.ts
git commit -m "test(compiler): add failing typing mode grammar specs"
```

### Task 2: Implement compiler grammar support for strict untyped mode

**Files:**
- Modify: `packages/compiler/src/token/TokenIterator.ts`
- Modify: `packages/compiler/src/token/constants/reserveds.ts`
- Modify: `packages/compiler/src/grammar/syntax/function-call.ts`
- Modify: `packages/compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/parameterListStmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/stmt.ts`
- Modify: `packages/compiler/src/grammar/syntax/typeStmt.ts` (or replace usage)
- Modify (if needed for messages): `packages/compiler/src/i18n/locales/*/grammar.ts`

**Step 1: Add minimal mode API in iterator**

```ts
export type GrammarConfig = {
  semicolonMode?: "optional-eol" | "required";
  blockMode?: "delimited" | "indentation";
  typingMode?: "typed" | "untyped";
};

getTypingMode(): "typed" | "untyped" {
  return this.grammar?.typingMode ?? "typed";
}
```

**Step 2: Add declaration keywords to reserved tokens**

```ts
export const RESERVEDS = {
  // ...existing
  variable: 53,
  function: 54,
};
```

Note: final key names should match project naming decision (`variavel` / `funcao`) while keeping stable numeric IDs.

**Step 3: Implement mode-branch parsing (minimal changes first)**
- In function declaration parser:
  - `typed`: keep `<type> IDENT (...)`
  - `untyped`: consume `funcao` token, then `IDENT (...)`
- In parameter parser:
  - `typed`: `<type> IDENT`
  - `untyped`: `IDENT` only
- In statement parser:
  - `typed`: declarations begin with type tokens
  - `untyped`: declarations begin with `variavel` token
- In declaration parser:
  - typed path unchanged
  - untyped path emits `DECLARE` using neutral type placeholder (e.g. `"dynamic"`), or `null` if emitter contract supports it.

**Step 4: Enforce strict rejection in untyped mode**
- If untyped mode sees type tokens in function/declaration/parameter contexts, throw grammar error.

**Step 5: Run target tests**

Run:
- `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/typing-mode.spec.ts`
- `npm run test --workspace=@ts-compilator-for-java/compiler -- src/tests/grammar/semicolon.spec.ts src/tests/grammar/indentation-config.spec.ts src/tests/grammar/block-delimiters.spec.ts`

Expected: PASS.

**Step 6: Commit compiler implementation**

```bash
git add packages/compiler/src/token/TokenIterator.ts \
  packages/compiler/src/token/constants/reserveds.ts \
  packages/compiler/src/grammar/syntax/function-call.ts \
  packages/compiler/src/grammar/syntax/declarationStmt.ts \
  packages/compiler/src/grammar/syntax/parameterListStmt.ts \
  packages/compiler/src/grammar/syntax/stmt.ts \
  packages/compiler/src/grammar/syntax/typeStmt.ts \
  packages/compiler/src/i18n/locales/en/grammar.ts \
  packages/compiler/src/i18n/locales/pt-BR/grammar.ts \
  packages/compiler/src/i18n/locales/pt-PT/grammar.ts \
  packages/compiler/src/i18n/locales/es/grammar.ts
git commit -m "feat(compiler): add strict typed/untyped grammar mode"
```

### Task 3: Add IDE config normalization and API propagation tests first

**Files:**
- Modify: `packages/ide/src/lib/compiler-config.spec.ts`
- Modify: `packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`
- Modify: `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`
- Reference impl targets:
  - `packages/ide/src/entities/compiler-config.ts`
  - `packages/ide/src/lib/compiler-config.ts`
  - `packages/ide/src/pages/api/intermediator.ts`
  - `packages/ide/src/pages/api/submissions/validate.ts`

**Step 1: Write failing tests for `typingMode`**
- Assert default normalize => `typingMode: "typed"`
- Assert provided normalize => preserves `"untyped"`
- Assert API tests expect `grammar.typingMode` forwarded into `TokenIterator`

**Step 2: Run tests to verify failures**

Run:
- `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts`
- `npm run test --workspace=@ts-compilator-for-java/ide -- src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/submission-config.spec.ts`

Expected: FAIL because type/propagation not implemented.

**Step 3: Implement minimal config + API changes**
- Extend IDE grammar types with `IDETypingMode`.
- Update normalizer defaults and output.
- Update API route body typings and `TokenIterator` constructor payload.

**Step 4: Re-run tests to verify pass**

Same commands as Step 2. Expected: PASS.

**Step 5: Commit IDE config/API changes**

```bash
git add packages/ide/src/entities/compiler-config.ts \
  packages/ide/src/lib/compiler-config.ts \
  packages/ide/src/lib/compiler-config.spec.ts \
  packages/ide/src/pages/api/intermediator.ts \
  packages/ide/src/pages/api/submissions/validate.ts \
  packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts \
  packages/ide/src/pages/api/__tests__/submission-config.spec.ts
git commit -m "feat(ide): propagate typing mode through compiler config and api"
```

### Task 4: Add typing mode to KeywordCustomizer and persistence flow

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Optional modify (if keyword customization should include untyped keywords): `packages/ide/src/contexts/KeywordContext.tsx` customizable keyword list

**Step 1: Add state + persistence for typing mode**
- Add `typingMode` to stored customization model.
- Add default loader fallback to `typed` for legacy localStorage.
- Include in `persistCustomization` and `buildLexerConfig().grammar`.

**Step 2: Add UI control in customizer**
- Add section “Modo de Tipagem” with two buttons:
  - `Tipado`
  - `Não tipado`
- Include in draft state, reset flow, save flow, dirty-check (`hasChanges`).

**Step 3: Ensure keyword coverage for untyped mode**
- If using same keyword customization flow, include `variavel` and `funcao` in customizable keyword map.

**Step 4: Run IDE tests + typecheck**

Run:
- `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/submission-config.spec.ts`
- `npm run build --workspace=@ts-compilator-for-java/ide`

Expected: PASS.

**Step 5: Commit customizer integration**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/entities/compiler-config.ts
git commit -m "feat(ide): add typing mode option to keyword customizer"
```

### Task 5: Final verification and integration checks

**Files:**
- No new files expected

**Step 1: Full targeted test sweep**

Run:
- `npm run test --workspace=@ts-compilator-for-java/compiler`
- `npm run test --workspace=@ts-compilator-for-java/ide -- src/lib/compiler-config.spec.ts src/pages/api/__tests__/intermediator-config.spec.ts src/pages/api/__tests__/submission-config.spec.ts`

Expected: PASS.

**Step 2: Manual smoke scenarios (IDE + API)**
- IDE `typingMode=untyped`, code:
  - `funcao main() { variavel x = 1; print(x); }` => compile ok
  - `int main() {}` => grammar error
- IDE `typingMode=typed`, existing sample still compiles.

**Step 3: Final commit (if any leftover)**

```bash
git add -A
git commit -m "chore: finalize typing mode integration" || true
```

