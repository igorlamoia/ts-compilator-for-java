# Bool And Array Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose `bool` and array mode support in the IDE customization flow, editor metadata, and compiler config payloads so the frontend matches the interpreter/compiler language features.

**Architecture:** Extend the existing `KeywordContext` grammar state instead of creating a new settings surface. Add `arrayMode` to the frontend grammar model and payload normalization, add `bool` to the customizable keyword and Monaco type metadata, and make editor snippets filter on both `typingMode` and `arrayMode`.

**Tech Stack:** React, Next.js, TypeScript, Monaco, Vitest

---

### Task 1: Extend grammar types and payload normalization

**Files:**
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Modify: `packages/ide/src/lib/compiler-config.ts`
- Test: `packages/ide/src/lib/compiler-config.spec.ts`
- Test: `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`

**Step 1: Write the failing normalization tests**

Add tests to `packages/ide/src/lib/compiler-config.spec.ts` covering:

```ts
it("defaults arrayMode to fixed", () => {
  const normalized = normalizeCompilerConfig({});

  expect(normalized.grammar.arrayMode).toBe("fixed");
});

it("preserves arrayMode when valid", () => {
  const normalized = normalizeCompilerConfig({
    grammar: {
      typingMode: "typed",
      arrayMode: "dynamic",
    },
  });

  expect(normalized.grammar.arrayMode).toBe("dynamic");
});

it("coerces untyped grammar to dynamic array mode", () => {
  const normalized = normalizeCompilerConfig({
    grammar: {
      typingMode: "untyped",
      arrayMode: "fixed",
    },
  });

  expect(normalized.grammar.arrayMode).toBe("dynamic");
});
```

Update `packages/ide/src/pages/api/__tests__/submission-config.spec.ts` so the request payload and expected iterator grammar include `arrayMode`.

**Step 2: Run the targeted tests to verify they fail**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/lib/compiler-config.spec.ts packages/ide/src/pages/api/__tests__/submission-config.spec.ts`

Expected: FAIL because `arrayMode` does not exist in the grammar types or normalized payload yet.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/entities/compiler-config.ts`:

```ts
export type IDEArrayMode = "fixed" | "dynamic";

export type IDEGrammarConfig = {
  semicolonMode: IDESemicolonMode;
  blockMode: IDEBlockMode;
  typingMode: IDETypingMode;
  arrayMode: IDEArrayMode;
};
```

Update `packages/ide/src/lib/compiler-config.ts` to:

- set `DEFAULT_GRAMMAR.arrayMode = "fixed"`
- read `input.grammar?.arrayMode`
- accept only `"fixed"` or `"dynamic"`
- coerce `typingMode === "untyped"` to `arrayMode = "dynamic"`

Update the API test expectations so the normalized grammar forwarded to `TokenIterator` includes `arrayMode`.

**Step 4: Run the targeted tests to verify they pass**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/lib/compiler-config.spec.ts packages/ide/src/pages/api/__tests__/submission-config.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/entities/compiler-config.ts packages/ide/src/lib/compiler-config.ts packages/ide/src/lib/compiler-config.spec.ts packages/ide/src/pages/api/__tests__/submission-config.spec.ts
git commit -m "feat: add array mode to frontend grammar config"
```

### Task 2: Persist array mode in KeywordContext and forward it through runtime hooks

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Test: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Test: `packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`

**Step 1: Write the failing forwarding tests**

Update `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts` so the mocked `buildLexerConfig()` returns:

```ts
grammar: {
  semicolonMode: "required",
  blockMode: "indentation",
  typingMode: "untyped",
  arrayMode: "dynamic",
}
```

Update `packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts` with the same grammar and assert `TokenIterator` receives `arrayMode`.

Add at least one test or assertion in the hook specs that verifies `buildLexerConfig()` now includes `arrayMode`.

**Step 2: Run the targeted tests to verify they fail**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: FAIL because current grammar mocks and/or expectations do not include `arrayMode`.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/contexts/KeywordContext.tsx` to:

- import `IDEArrayMode`
- add `arrayMode` and `setArrayMode` to the context type
- add `arrayMode` to `StoredKeywordCustomization`
- add `getDefaultArrayMode(): IDEArrayMode` returning `"fixed"`
- load persisted `arrayMode`, validate it, and coerce untyped mode to dynamic
- persist `arrayMode`
- include `arrayMode` in `buildLexerConfig().grammar`
- make reset/default behavior restore a valid `typingMode` + `arrayMode` pair

If you need a helper, add a local coercion function such as:

```ts
function normalizeArrayMode(
  typingMode: IDETypingMode,
  arrayMode: IDEArrayMode,
): IDEArrayMode {
  return typingMode === "untyped" ? "dynamic" : arrayMode;
}
```

**Step 4: Run the targeted tests to verify they pass**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts
git commit -m "feat: persist and forward array mode in keyword context"
```

### Task 3: Add bool customization and array mode controls to the modal

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`

**Step 1: Write the failing UI test or document the current gap**

If there is no existing component test for the modal, add a focused test file:

- Create: `packages/ide/src/components/keyword-customizer.spec.tsx`

Cover:

```tsx
it("shows bool as a customizable type keyword", () => {
  expect(screen.getByText(/bool/i)).toBeInTheDocument();
});

it("disables fixed array mode when typing mode is untyped", () => {
  // open the modal with a mocked KeywordContext
  // switch typing mode to untyped
  // assert the fixed option is disabled
  // assert the explanatory text is visible
});
```

If adding a new component test is too expensive for the first pass, document that choice in the commit message and make the integration coverage in later tasks stronger. Prefer the test.

**Step 2: Run the targeted test to verify it fails**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/components/keyword-customizer.spec.tsx`

Expected: FAIL because `bool` and array mode controls do not exist yet.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/contexts/KeywordContext.tsx`:

- add `bool` to `CUSTOMIZABLE_KEYWORDS` with the correct token id from the compiler

Update `packages/ide/src/components/keyword-customizer.tsx`:

- add a `bool` explanation entry
- read `arrayMode` and `setArrayMode` from the context
- create `draftArrayMode` state
- include it in open/reset/save/hasChanges flows
- add the new section `Modo de Vetores e Matrizes`
- render buttons for `fixed` and `dynamic`
- disable the fixed button when `draftTypingMode === "untyped"`
- when typing mode changes to `untyped`, immediately coerce `draftArrayMode` to `dynamic`
- show the explanatory message for the disabled fixed option

Use button semantics that tests can target reliably, for example:

```tsx
<button type="button" disabled={draftTypingMode === "untyped"}>
  Tamanho fixo
</button>
```

**Step 4: Run the targeted test to verify it passes**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/components/keyword-customizer.spec.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/components/keyword-customizer.tsx packages/ide/src/components/keyword-customizer.spec.tsx packages/ide/src/contexts/KeywordContext.tsx
git commit -m "feat: expose bool and array mode in keyword customizer"
```

### Task 4: Update Monaco language metadata for bool and built-in boolean literals

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing editor-language tests**

Extend `packages/ide/src/utils/compiler/editor/editor-language.spec.ts` with:

```ts
it("treats bool as a type keyword", () => {
  const metadata = buildJavaMMLanguageMetadata([
    { original: "bool", custom: "logico", tokenId: 55 },
  ]);

  expect(metadata.semanticGroups.types).toContain("logico");
});

it("includes true and false as built-in boolean literals", () => {
  const metadata = buildJavaMMLanguageMetadata([
    { original: "bool", custom: "bool", tokenId: 55 },
  ]);
  const language = buildJavaMMMonarchLanguage(metadata);

  expect(language.keywords).toEqual(
    expect.arrayContaining(["true", "false"]),
  );
});
```

If the final tokenizer shape uses a separate literals collection instead of `keywords`, adjust the expectation to match the implementation, but keep the test focused on Monaco recognizing `true` and `false`.

**Step 2: Run the targeted tests to verify they fail**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because `bool` is not in the type semantic group and boolean literals are not part of the Monaco metadata.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/utils/compiler/editor/editor-language.ts` to:

- add `bool` to `SEMANTIC_KEYWORD_GROUPS.types`
- add a boolean literal mechanism for `true` and `false`
- ensure Monaco tokenization treats them as language literals or keywords consistently

Keep `true` and `false` non-customizable. Do not add them to `CUSTOMIZABLE_KEYWORDS`.

**Step 4: Run the targeted tests to verify they pass**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "feat: add bool and boolean literals to editor language metadata"
```

### Task 5: Add array-aware snippets for vector and matrix declarations

**Files:**
- Modify: `packages/ide/src/utils/compiler/editor/types.ts`
- Modify: `packages/ide/src/utils/compiler/editor/keyword-snippets.ts`
- Modify: `packages/ide/src/utils/compiler/editor/editor-language.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

**Step 1: Write the failing snippet-filter tests**

Add tests that verify snippet suggestions respect `typingMode` and `arrayMode`.

Example shape:

```ts
it("shows fixed array snippets only in typed fixed mode", () => {
  // register language with typingMode: "typed", arrayMode: "fixed"
  // assert suggestions include "int vetor[10];" and "int matriz[3][3];"
});

it("shows dynamic array snippets in typed dynamic mode", () => {
  // assert suggestions include "int vetor[];" and "int matriz[][];"
});

it("shows only dynamic array snippets in untyped mode", () => {
  // assert fixed snippets are absent
  // assert "lista[] = [];"-style snippet is present
});
```

If `registerCompletionItemProvider` mocking is noisy, factor the filtering into a small pure helper in `editor-language.ts` and test that helper directly.

**Step 2: Run the targeted tests to verify they fail**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: FAIL because snippet types currently only understand `typingMode` and `blockMode`.

**Step 3: Write the minimal implementation**

Update `packages/ide/src/utils/compiler/editor/types.ts`:

```ts
export type JavaMMArrayMode = "fixed" | "dynamic";

export type JavaMMSnippetVariant = {
  body: string;
  description: string;
  labelSuffix?: string;
  typingMode?: JavaMMTypingMode;
  blockMode?: JavaMMBlockMode;
  arrayMode?: JavaMMArrayMode;
};
```

Update `packages/ide/src/utils/compiler/editor/editor-language.ts` to:

- accept `arrayMode` in `JavaMMLanguageOptions`
- propagate a preferred array mode in completion generation
- update `isSnippetSupported()` to check `arrayMode`

Update `packages/ide/src/utils/compiler/editor/keyword-snippets.ts` to add:

- typed fixed snippets for vectors and matrices
- typed dynamic snippets for vectors and matrices
- untyped dynamic array snippet(s)
- a `bool` declaration snippet such as `bool ${1:nome};`

Prefer reusing the `int` key for typed array examples if that keeps completion UX compact, for example:

```ts
int: [
  { body: "int ${1:nome};", description: "Declarar int", typingMode: "typed" },
  { body: "int ${1:vetor}[${2:10}];", description: "Declarar vetor fixo", typingMode: "typed", arrayMode: "fixed" },
  { body: "int ${1:matriz}[${2:3}][${3:3}];", description: "Declarar matriz fixa", typingMode: "typed", arrayMode: "fixed" },
  { body: "int ${1:vetor}[];", description: "Declarar vetor dinâmico", typingMode: "typed", arrayMode: "dynamic" },
  { body: "int ${1:matriz}[][];", description: "Declarar matriz dinâmica", typingMode: "typed", arrayMode: "dynamic" },
]
```

**Step 4: Run the targeted tests to verify they pass**

Run: `npm --workspace packages/ide run vitest -- packages/ide/src/utils/compiler/editor/editor-language.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/utils/compiler/editor/types.ts packages/ide/src/utils/compiler/editor/keyword-snippets.ts packages/ide/src/utils/compiler/editor/editor-language.ts packages/ide/src/utils/compiler/editor/editor-language.spec.ts
git commit -m "feat: filter editor snippets by array mode"
```

### Task 6: Run the full IDE verification sweep

**Files:**
- Modify: none
- Test: `packages/ide/src/lib/compiler-config.spec.ts`
- Test: `packages/ide/src/pages/api/__tests__/submission-config.spec.ts`
- Test: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Test: `packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`
- Test: `packages/ide/src/utils/compiler/editor/editor-language.spec.ts`
- Test: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Run the focused suite**

Run:

```bash
npm --workspace packages/ide run vitest -- \
  packages/ide/src/lib/compiler-config.spec.ts \
  packages/ide/src/pages/api/__tests__/submission-config.spec.ts \
  packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts \
  packages/ide/src/utils/compiler/editor/editor-language.spec.ts \
  packages/ide/src/components/keyword-customizer.spec.tsx
```

Expected: PASS

**Step 2: Run the broader IDE test command**

Run: `npm --workspace packages/ide run test`

Expected: PASS, or fail only on unrelated pre-existing issues. If unrelated failures appear, document them with exact test names before proceeding.

**Step 3: Review the changed files**

Run: `git diff --stat HEAD~5..HEAD`

Expected: only the planned frontend files and tests are touched.

**Step 4: Commit the verification checkpoint**

```bash
git add -A
git commit -m "test: verify bool and array frontend integration"
```

**Step 5: Prepare review**

Run:

```bash
git status --short
git log --oneline -n 6
```

Expected: clean worktree and a readable task-by-task history.
