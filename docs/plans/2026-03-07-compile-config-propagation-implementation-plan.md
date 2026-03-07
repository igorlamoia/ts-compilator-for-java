# Compile Config Propagation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `/lexer`, `/intermediator`, and `/submissions/validate` consume the same compiler config payload so grammar, indentation mode, and delimiters are applied consistently.

**Architecture:** Introduce shared API payload/normalization utilities in IDE, then wire frontend callers and backend routes to use the same normalized config before constructing `Lexer`/`TokenIterator`. Validate behavior with focused API tests for normalization and propagation plus route-level verification.

**Tech Stack:** Next.js Pages Router (TypeScript), compiler package (`Lexer`, `TokenIterator`), Vitest (IDE tests), npm workspaces.

---

### Task 1: Add Shared Compile Config Types + Normalizer

**Files:**
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Create: `packages/ide/src/lib/compiler-config.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

Use: `@superpowers/test-driven-development`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { normalizeCompilerConfig } from "./compiler-config";

describe("normalizeCompilerConfig", () => {
  it("defaults to delimited + optional-eol", () => {
    const normalized = normalizeCompilerConfig({});

    expect(normalized.grammar).toEqual({
      semicolonMode: "optional-eol",
      blockMode: "delimited",
    });
    expect(normalized.indentationBlock).toBe(false);
    expect(normalized.blockDelimiters).toBeUndefined();
  });

  it("forces indentationBlock=true and strips delimiters in indentation mode", () => {
    const normalized = normalizeCompilerConfig({
      indentationBlock: false,
      blockDelimiters: { open: "begin", close: "end" },
      grammar: { semicolonMode: "required", blockMode: "indentation" },
    });

    expect(normalized.indentationBlock).toBe(true);
    expect(normalized.blockDelimiters).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/lib/compiler-config.spec.ts`
Expected: FAIL with module/function not found.

**Step 3: Write minimal implementation**

```ts
import type {
  IDECompilerConfigPayload,
  IDEGrammarConfig,
  IDEPartialCompilerConfigPayload,
} from "@/entities/compiler-config";

const DEFAULT_GRAMMAR: IDEGrammarConfig = {
  semicolonMode: "optional-eol",
  blockMode: "delimited",
};

export function normalizeCompilerConfig(
  input: IDEPartialCompilerConfigPayload,
): IDECompilerConfigPayload {
  const grammar: IDEGrammarConfig = {
    semicolonMode: input.grammar?.semicolonMode ?? DEFAULT_GRAMMAR.semicolonMode,
    blockMode: input.grammar?.blockMode ?? DEFAULT_GRAMMAR.blockMode,
  };

  const indentationBlock = grammar.blockMode === "indentation";
  const hasDelimiters =
    typeof input.blockDelimiters?.open === "string" &&
    typeof input.blockDelimiters?.close === "string" &&
    input.blockDelimiters.open.trim().length > 0 &&
    input.blockDelimiters.close.trim().length > 0;

  return {
    keywordMap: input.keywordMap ?? {},
    grammar,
    indentationBlock,
    ...(grammar.blockMode === "delimited" && hasDelimiters
      ? {
          blockDelimiters: {
            open: input.blockDelimiters!.open.trim(),
            close: input.blockDelimiters!.close.trim(),
          },
        }
      : {}),
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/lib/compiler-config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/entities/compiler-config.ts packages/ide/src/lib/compiler-config.ts packages/ide/src/lib/compiler-config.spec.ts
git commit -m "feat(ide): add shared compiler config normalizer"
```

### Task 2: Send Grammar in Intermediator Frontend Hook

**Files:**
- Modify: `packages/ide/src/hooks/useIntermediatorCode.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`

Use: `@superpowers/test-driven-development`

**Step 1: Write the failing test**

```ts
it("preserves grammar from UI payload when present", () => {
  const normalized = normalizeCompilerConfig({
    grammar: { semicolonMode: "required", blockMode: "delimited" },
  });

  expect(normalized.grammar.semicolonMode).toBe("required");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/lib/compiler-config.spec.ts`
Expected: FAIL if grammar handling is incomplete.

**Step 3: Write minimal implementation**

```ts
const { buildLexerConfig } = useKeywords();

const lexerConfig = buildLexerConfig();
await api.post<TIntermediateCodeData>("/intermediator", {
  tokens,
  locale,
  grammar: lexerConfig.grammar,
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/lib/compiler-config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/hooks/useIntermediatorCode.ts packages/ide/src/lib/compiler-config.spec.ts
git commit -m "feat(ide): send grammar config to intermediator api"
```

### Task 3: Apply Grammar in `/api/intermediator`

**Files:**
- Modify: `packages/ide/src/pages/api/intermediator.ts`
- Create: `packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`

Use: `@superpowers/test-driven-development`

**Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";

it("passes grammar to TokenIterator", async () => {
  const mockGenerateIntermediateCode = vi.fn(() => []);
  const TokenIteratorMock = vi.fn(() => ({
    generateIntermediateCode: mockGenerateIntermediateCode,
  }));

  // invoke route with grammar payload, then assert constructor args include { locale, grammar }
  expect(TokenIteratorMock).toHaveBeenCalledWith(expect.any(Array), {
    locale: "pt-BR",
    grammar: { semicolonMode: "required", blockMode: "indentation" },
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`
Expected: FAIL because route currently ignores grammar.

**Step 3: Write minimal implementation**

```ts
const { tokens, locale, grammar } = req.body as {
  tokens: Token[];
  locale?: string;
  grammar?: IDEGrammarConfig;
};

const iterator = new TokenIterator(tokens, {
  locale,
  grammar,
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/intermediator.ts packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts
git commit -m "feat(api): apply grammar config in intermediator route"
```

### Task 4: Propagate Full Config in Submission Frontend + API

**Files:**
- Modify: `packages/ide/src/pages/exercises/workspace.tsx`
- Modify: `packages/ide/src/pages/api/submissions/validate.ts`
- Create: `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`

Use: `@superpowers/test-driven-development`

**Step 1: Write the failing test**

```ts
it("normalizes payload and passes config to lexer and iterator", async () => {
  // call validate route with grammar.blockMode=indentation and custom delimiters
  // assert Lexer receives indentationBlock=true and no blockDelimiters
  // assert TokenIterator receives { locale, grammar }
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ide/src/pages/api/__tests__/submission-config.spec.ts`
Expected: FAIL because route currently ignores grammar/indentation config.

**Step 3: Write minimal implementation**

```ts
const {
  exerciseId,
  sourceCode,
  keywordMap,
  blockDelimiters,
  indentationBlock,
  grammar,
  locale,
} = req.body;

const normalized = normalizeCompilerConfig({
  keywordMap,
  blockDelimiters,
  indentationBlock,
  grammar,
});

const lexer = new Lexer(sourceCode, {
  customKeywords: buildEffectiveKeywordMap(normalized.keywordMap),
  blockDelimiters: normalized.blockDelimiters,
  indentationBlock: normalized.indentationBlock,
});

const iterator = new TokenIterator(tokens, {
  locale,
  grammar: normalized.grammar,
});
```

Update frontend submit payload:

```ts
const lexerConfig = buildLexerConfig();
await api.post("/submissions/validate", {
  exerciseId: exercise.id,
  sourceCode: code,
  keywordMap: lexerConfig.keywordMap,
  blockDelimiters: lexerConfig.blockDelimiters,
  indentationBlock: lexerConfig.indentationBlock,
  grammar: lexerConfig.grammar,
  locale,
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ide/src/pages/api/__tests__/submission-config.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/exercises/workspace.tsx packages/ide/src/pages/api/submissions/validate.ts packages/ide/src/pages/api/__tests__/submission-config.spec.ts
git commit -m "feat(api): align submission validation with full compiler config"
```

### Task 5: Verify End-to-End Consistency and Quality Gates

**Files:**
- Modify: `packages/ide/src/pages/api/intermediator.ts` (if small final adjustments)
- Modify: `packages/ide/src/pages/api/submissions/validate.ts` (if small final adjustments)

Use: `@superpowers/verification-before-completion`

**Step 1: Run focused API tests**

Run: `npx vitest run packages/ide/src/lib/compiler-config.spec.ts packages/ide/src/pages/api/__tests__/intermediator-config.spec.ts packages/ide/src/pages/api/__tests__/submission-config.spec.ts`
Expected: PASS all.

**Step 2: Run IDE lint/type safety checks**

Run: `npm run lint --workspace @ts-compilator-for-java/ide`
Expected: PASS with no new errors.

**Step 3: Run compiler regression tests relevant to grammar modes**

Run: `npm run test --workspace @ts-compilator-for-java/compiler -- --run packages/compiler/src/tests/grammar/semicolon.spec.ts packages/compiler/src/tests/grammar/indentation-config.spec.ts packages/compiler/src/tests/grammar/block-delimiters.spec.ts`
Expected: PASS.

**Step 4: Manual route smoke checks**

Run project locally and verify:
- Lexer analysis and intermediator succeed in `required` semicolon mode.
- Submission validation respects indentation mode and returns consistent errors/success with lexer/intermediator.

Expected: Same code + same config => same compile behavior across all three flows.

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/intermediator.ts packages/ide/src/pages/api/submissions/validate.ts
git commit -m "test(ide): verify compile config propagation across routes"
```
