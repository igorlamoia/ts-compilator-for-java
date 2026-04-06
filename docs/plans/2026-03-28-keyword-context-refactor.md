# Keyword Context Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `KeywordContext` to use one canonical customization object with grouped setters, then update `keyword-customizer` and its consumers to use the new API without keeping compatibility with the current flat context shape.

**Architecture:** Keep one canonical `customization` object in `KeywordContext`, aligned with persisted localStorage data. Nest grammar modes and modal UI state inside that object, expose a small grouped API (`setCustomization`, `setModes`, `setUi`, `setMappings`, `resetCustomization`), and make `keyword-customizer` edit a single draft object instead of separate draft states. Preserve the external compiler payload contract through `buildLexerConfig()`.

**Tech Stack:** React 19, Next.js Pages Router, TypeScript, Vitest, localStorage-backed context state, Monaco integration.

---

### Task 1: Reshape KeywordContext around one canonical state object

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify: `packages/ide/src/entities/compiler-config.ts`
- Test: `packages/ide/src/contexts/KeywordContext.spec.ts`

**Step 1: Write the failing provider tests for the new API**

Add tests in `packages/ide/src/contexts/KeywordContext.spec.ts` that assert the provider now exposes:

```ts
capturedKeywords?.customization.modes.array;
capturedKeywords?.setModes((prev) => ({ ...prev, typing: "untyped" }));
capturedKeywords?.setUi((prev) => ({
  ...prev,
  isKeywordCustomizerOpen: true,
}));
```

Add at least one expectation proving:

```ts
expect(capturedKeywords?.buildLexerConfig().grammar).toEqual({
  semicolonMode: "optional-eol",
  blockMode: "delimited",
  typingMode: "untyped",
  arrayMode: "fixed",
});
```

**Step 2: Run the focused context tests to verify they fail**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts`

Expected: FAIL with missing `customization`, missing grouped setters, or old field references.

**Step 3: Replace flat provider state with one canonical object**

In `packages/ide/src/contexts/KeywordContext.tsx`:

- introduce a single `KeywordCustomizationState` type
- move grammar fields under `modes`
- move modal state under `ui`
- replace many `useState` calls with one `useState<KeywordCustomizationState>`
- implement grouped setters with updater signatures
- keep `buildKeywordMap()` and `buildLexerConfig()` as derived helpers

Implementation target:

```ts
const [customization, setCustomizationState] =
  useState<KeywordCustomizationState>(getDefaultCustomizationState);

const setCustomization = useCallback((nextOrUpdater) => {
  setCustomizationState((prev) =>
    typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater,
  );
}, []);

const setModes = useCallback((nextOrUpdater) => {
  setCustomizationState((prev) => ({
    ...prev,
    modes:
      typeof nextOrUpdater === "function"
        ? nextOrUpdater(prev.modes)
        : nextOrUpdater,
  }));
}, []);
```

Keep the persisted storage key the same, but normalize loaded data into the new shape.

**Step 4: Run the context tests again**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/entities/compiler-config.ts \
  packages/ide/src/contexts/KeywordContext.spec.ts
git commit -m "refactor(ide): unify keyword context state"
```

### Task 2: Normalize loading, persistence, and derivations against the nested state

**Files:**
- Modify: `packages/ide/src/contexts/KeywordContext.tsx`
- Test: `packages/ide/src/contexts/KeywordContext.spec.ts`
- Test: `packages/ide/src/lib/operator-word-map.spec.ts`

**Step 1: Write failing tests for migration and nested storage normalization**

In `packages/ide/src/contexts/KeywordContext.spec.ts`, add coverage for:

- loading current storage data and normalizing into `customization.modes` and `customization.ui`
- migrating `keyword-mappings` legacy data into the new full state
- preserving `buildLexerConfig()` output after the nested refactor

Suggested assertion shape:

```ts
expect(capturedKeywords?.customization).toMatchObject({
  mappings: expect.any(Array),
  modes: {
    semicolon: "required",
    block: "indentation",
    typing: "typed",
    array: "dynamic",
  },
  ui: {
    isKeywordCustomizerOpen: false,
  },
});
```

**Step 2: Run focused tests to verify migration failures**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts src/lib/operator-word-map.spec.ts`

Expected: FAIL on shape mismatches or incomplete migration.

**Step 3: Implement nested defaults and migration helpers**

Refactor the default/hydration helpers in `packages/ide/src/contexts/KeywordContext.tsx` to:

- return a default full state object from one helper
- migrate stored flat mode fields into nested `modes`
- initialize `ui.isKeywordCustomizerOpen` to `false`
- persist the normalized full object immediately after load

Keep validation helpers pure, but update their call sites so they read from the new canonical state.

**Step 4: Re-run the focused tests**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/contexts/KeywordContext.spec.ts src/lib/operator-word-map.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/contexts/KeywordContext.spec.ts \
  packages/ide/src/lib/operator-word-map.spec.ts
git commit -m "refactor(ide): normalize keyword customization state"
```

### Task 3: Refactor keyword-customizer to one draft object

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer.tsx`
- Test: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Rewrite the customizer tests around the new context API**

Update `packages/ide/src/components/keyword-customizer.spec.tsx` so the mocked context provides:

```ts
{
  customization: {
    mappings,
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
    modes: {
      semicolon: "optional-eol",
      block: "delimited",
      typing: "untyped",
      array: "dynamic",
    },
    ui: {
      isKeywordCustomizerOpen: true,
    },
  },
  setCustomization: vi.fn(),
  setModes: vi.fn(),
  setUi: vi.fn(),
  setMappings: vi.fn(),
}
```

Add a failing save test that asserts the component writes the consolidated draft through the new API instead of calling many field setters.

**Step 2: Run the customizer tests to verify they fail**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/components/keyword-customizer.spec.tsx`

Expected: FAIL because the component still consumes flat context fields and field-level setters.

**Step 3: Refactor the component to use one draft object**

In `packages/ide/src/components/keyword-customizer.tsx`:

- replace many `draft*` states with one `draftCustomization`
- copy `customization` into `draftCustomization` when the modal opens
- read current keyword, modes, aliases, delimiters, and modal state from that draft object
- save with one grouped update, for example:

```ts
setCustomization((prev) => ({
  ...prev,
  ...draftCustomization,
  ui: {
    ...prev.ui,
    isKeywordCustomizerOpen: false,
  },
}));
```

- reset draft state from a single default customization helper instead of issuing many sequential setter calls

**Step 4: Re-run the customizer tests**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/components/keyword-customizer.spec.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/components/keyword-customizer.spec.tsx
git commit -m "refactor(ide): simplify keyword customizer state"
```

### Task 4: Migrate remaining consumers to the new nested context shape

**Files:**
- Modify: `packages/ide/src/views/tokens/show-tokens.tsx`
- Modify: `packages/ide/src/views/ide/components/side-menu.tsx`
- Modify: `packages/ide/src/hooks/useLexerAnalyse.ts`
- Modify: `packages/ide/src/hooks/useIntermediatorCode.ts`
- Modify: `packages/ide/src/pages/exercises/workspace.tsx`
- Test: `packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts`
- Test: `packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts`

**Step 1: Update failing tests and mocks for the new provider shape**

Adjust hook and component mocks so they use the renamed API where needed:

- consumers that only need `buildLexerConfig()` can keep that mock
- consumers that read mappings or modal control must switch to `customization.mappings` and `setUi(...)`

For the side menu behavior, the expected interaction should be:

```ts
setUi((prev) => ({
  ...prev,
  isKeywordCustomizerOpen: true,
}));
```

**Step 2: Run the affected tests to verify failures**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/hooks/use-lexer-analyse.spec.ts src/tests/integration/hooks/use-intermediator-code.spec.ts src/components/keyword-customizer.spec.tsx`

Expected: FAIL on outdated mocks or old field access.

**Step 3: Update the consumers**

Apply the new shape:

- `show-tokens.tsx` reads `customization.mappings`
- `side-menu.tsx` opens the modal through `setUi`
- hook consumers continue to rely on `buildLexerConfig()` without re-expanding the context
- `workspace.tsx` continues to consume only `buildLexerConfig()`

Prefer minimal consumer changes when `buildLexerConfig()` already abstracts the state shape.

**Step 4: Re-run the affected tests**

Run: `npm run test --workspace=@ts-compilator-for-java/ide -- src/tests/integration/hooks/use-lexer-analyse.spec.ts src/tests/integration/hooks/use-intermediator-code.spec.ts src/components/keyword-customizer.spec.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/views/tokens/show-tokens.tsx \
  packages/ide/src/views/ide/components/side-menu.tsx \
  packages/ide/src/hooks/useLexerAnalyse.ts \
  packages/ide/src/hooks/useIntermediatorCode.ts \
  packages/ide/src/pages/exercises/workspace.tsx \
  packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts
git commit -m "refactor(ide): migrate keyword context consumers"
```

### Task 5: Run the full focused verification pass

**Files:**
- Modify if needed: `packages/ide/src/contexts/KeywordContext.tsx`
- Modify if needed: `packages/ide/src/components/keyword-customizer.tsx`
- Modify if needed: affected spec files from prior tasks

**Step 1: Run the full targeted test suite**

Run:

```bash
npm run test --workspace=@ts-compilator-for-java/ide -- \
  src/contexts/KeywordContext.spec.ts \
  src/lib/operator-word-map.spec.ts \
  src/components/keyword-customizer.spec.tsx \
  src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  src/tests/integration/hooks/use-intermediator-code.spec.ts
```

Expected: PASS

**Step 2: Run lint on the IDE package**

Run: `npm run lint --workspace=@ts-compilator-for-java/ide`

Expected: PASS

**Step 3: Fix any remaining typing, lint, or test regressions minimally**

If any failure appears, adjust only the touched files and re-run the exact failing command before broad reruns.

Example minimal cleanup:

```ts
const mappings = customization.mappings;
const isOpen = customization.ui.isKeywordCustomizerOpen;
```

**Step 4: Re-run the failing command and then the full targeted suite**

Run the exact failing command first, then:

```bash
npm run test --workspace=@ts-compilator-for-java/ide -- \
  src/contexts/KeywordContext.spec.ts \
  src/lib/operator-word-map.spec.ts \
  src/components/keyword-customizer.spec.tsx \
  src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  src/tests/integration/hooks/use-intermediator-code.spec.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/KeywordContext.tsx \
  packages/ide/src/components/keyword-customizer.tsx \
  packages/ide/src/views/tokens/show-tokens.tsx \
  packages/ide/src/views/ide/components/side-menu.tsx \
  packages/ide/src/hooks/useLexerAnalyse.ts \
  packages/ide/src/hooks/useIntermediatorCode.ts \
  packages/ide/src/pages/exercises/workspace.tsx \
  packages/ide/src/contexts/KeywordContext.spec.ts \
  packages/ide/src/lib/operator-word-map.spec.ts \
  packages/ide/src/components/keyword-customizer.spec.tsx \
  packages/ide/src/tests/integration/hooks/use-lexer-analyse.spec.ts \
  packages/ide/src/tests/integration/hooks/use-intermediator-code.spec.ts
git commit -m "test(ide): verify keyword context refactor"
```
