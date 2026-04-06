# Saved Language Identity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add named saved languages with optional Pixabay-selected images, persist them through a registry plus per-language localStorage entries, and expose a dropdown in the IDE to switch the active language.

**Architecture:** Keep compiler-facing customization in `StoredKeywordCustomization` and add language identity as a separate saved-language layer managed by a small storage helper. The keyword customizer will own the identity fields during the wizard session, save them into the registry and per-language keys, and the `KeywordProvider` plus IDE menu will load and switch the active saved language by synchronizing `keyword-customization`.

**Tech Stack:** TypeScript, React, Next.js Pages API routes, Vitest, jsdom

---

### Task 1: Specify saved-language storage behavior

**Files:**
- Create: `packages/ide/src/lib/keyword-language-storage.spec.ts`
- Reference: `packages/ide/src/contexts/keyword/types.ts`

**Step 1: Write the failing test**

Add tests covering:
- slug normalization from a language name
- registry upsert without duplicate slugs
- save payload writing `keyword-customization-index`, `keyword-customization-<slug>`, `keyword-customization`, and `keyword-customization-active`
- fallback when registry or saved entry is invalid

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/lib/keyword-language-storage.spec.ts`
Expected: FAIL because the storage helper does not exist yet.

**Step 3: Write minimal implementation**

Create the storage helper API and types with just enough behavior to satisfy the storage contract.

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/lib/keyword-language-storage.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/lib/keyword-language-storage.spec.ts packages/ide/src/lib/keyword-language-storage.ts packages/ide/src/contexts/keyword/types.ts
git commit -m "feat: add saved language storage helpers"
```

### Task 2: Implement the saved-language storage helper

**Files:**
- Create: `packages/ide/src/lib/keyword-language-storage.ts`
- Modify: `packages/ide/src/contexts/keyword/types.ts`
- Test: `packages/ide/src/lib/keyword-language-storage.spec.ts`

**Step 1: Write the failing test**

Use the coverage from Task 1 as the contract for:
- `slugifyLanguageName`
- `listSavedKeywordLanguages`
- `loadSavedKeywordLanguage`
- `saveSavedKeywordLanguage`
- `setActiveSavedKeywordLanguage`

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/lib/keyword-language-storage.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement the helper with:
- storage key constants
- saved-language types
- JSON parse guards
- registry filtering for corrupt references
- overwrite-by-slug behavior

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/lib/keyword-language-storage.spec.ts`
Expected: PASS

### Task 3: Specify Pixabay server route behavior

**Files:**
- Create: `packages/ide/src/pages/api/__tests__/language-image-search.spec.ts`
- Reference: `packages/ide/src/pages/api/submissions/validate.ts`

**Step 1: Write the failing test**

Add tests covering:
- rejection of missing or blank `q`
- success response mapping Pixabay hits into trimmed client payload fields
- failure response when API key is missing
- upstream error handling

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/pages/api/__tests__/language-image-search.spec.ts`
Expected: FAIL because the route does not exist yet.

**Step 3: Write minimal implementation**

Add the route skeleton and the minimum request validation for the tests to bind against.

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/pages/api/__tests__/language-image-search.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/pages/api/__tests__/language-image-search.spec.ts packages/ide/src/pages/api/language-images/search.ts packages/ide/env.example
git commit -m "feat: add server-side language image search"
```

### Task 4: Implement the Pixabay server route

**Files:**
- Create: `packages/ide/src/pages/api/language-images/search.ts`
- Modify: `packages/ide/env.example`
- Test: `packages/ide/src/pages/api/__tests__/language-image-search.spec.ts`

**Step 1: Write the failing test**

Use the Task 3 tests as the route contract.

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/pages/api/__tests__/language-image-search.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:
- `PIXABAY_API_KEY` server env usage
- query trimming and validation
- server-side `fetch` to Pixabay
- response mapping to `{ id, previewURL, webformatURL, tags }[]`
- non-200 handling without leaking internals

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/pages/api/__tests__/language-image-search.spec.ts`
Expected: PASS

### Task 5: Specify wizard identity state and preview naming

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/steps/identity-step.spec.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.spec.ts`
- Modify: `packages/ide/src/components/keyword-customizer/preview-data.spec.ts`
- Modify: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Add tests covering:
- required language name input in the identity step
- image search results and selection callback wiring in the identity step
- preview label preferring the custom language name over preset label
- wizard save writing saved-language metadata through the context

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/components/keyword-customizer/steps/identity-step.spec.tsx src/components/keyword-customizer/preview-data.spec.ts src/components/keyword-customizer.spec.tsx`
Expected: FAIL because the wizard does not yet track language identity fields.

**Step 3: Write minimal implementation**

Add only the type and prop scaffolding needed to compile against the new tests.

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/components/keyword-customizer/steps/identity-step.spec.tsx src/components/keyword-customizer/preview-data.spec.ts src/components/keyword-customizer.spec.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/components/keyword-customizer/steps/identity-step.spec.tsx packages/ide/src/components/keyword-customizer/preview-data.spec.ts packages/ide/src/components/keyword-customizer.spec.tsx packages/ide/src/components/keyword-customizer/wizard-model.spec.ts
git commit -m "test: cover saved language identity flow"
```

### Task 6: Implement wizard identity state and preview naming

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/steps/identity-step.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-types.ts`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-step-props.ts`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-context.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/preview-data.ts`
- Modify: `packages/ide/src/components/keyword-customizer/wizard-model.ts`
- Test: `packages/ide/src/components/keyword-customizer/steps/identity-step.spec.tsx`
- Test: `packages/ide/src/components/keyword-customizer/preview-data.spec.ts`
- Test: `packages/ide/src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Use the Task 5 tests as the implementation contract.

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/components/keyword-customizer/steps/identity-step.spec.tsx src/components/keyword-customizer/preview-data.spec.ts src/components/keyword-customizer.spec.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:
- wizard-local `languageName`, `languageImageUrl`, and `languageImageQuery`
- required-name validation before save and optionally before moving past identity
- identity-step UI with text input, search input, loading/error/result states, and select button
- preview label fallback from custom name to preset label

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/components/keyword-customizer/steps/identity-step.spec.tsx src/components/keyword-customizer/preview-data.spec.ts src/components/keyword-customizer.spec.tsx`
Expected: PASS

### Task 7: Specify active-language loading in KeywordProvider

**Files:**
- Modify: `packages/ide/src/contexts/keyword/KeywordContext.spec.ts`
- Reference: `packages/ide/src/contexts/keyword/KeywordContext.tsx`

**Step 1: Write the failing test**

Add tests covering:
- hydration from `keyword-customization-active` plus `keyword-customization-<slug>`
- fallback to default customization when the active entry is corrupt
- active customization rewrite to `keyword-customization` after successful load

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/contexts/keyword/KeywordContext.spec.ts`
Expected: FAIL because the provider only reads `keyword-customization`.

**Step 3: Write minimal implementation**

Add provider-loading scaffolding needed for the new tests.

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/contexts/keyword/KeywordContext.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/contexts/keyword/KeywordContext.spec.ts packages/ide/src/contexts/keyword/KeywordContext.tsx
git commit -m "feat: restore active saved language in keyword provider"
```

### Task 8: Implement active-language loading in KeywordProvider

**Files:**
- Modify: `packages/ide/src/contexts/keyword/KeywordContext.tsx`
- Modify: `packages/ide/src/contexts/keyword/types.ts`
- Modify: `packages/ide/src/lib/keyword-language-storage.ts`
- Test: `packages/ide/src/contexts/keyword/KeywordContext.spec.ts`

**Step 1: Write the failing test**

Use the Task 7 tests as the provider contract.

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/contexts/keyword/KeywordContext.spec.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Update hydration to:
- check the active saved-language key first
- load and validate the saved-language customization
- persist the resolved active customization back to `keyword-customization`
- keep the existing legacy fallback behavior intact

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/contexts/keyword/KeywordContext.spec.ts`
Expected: PASS

### Task 9: Specify IDE language switcher behavior

**Files:**
- Create: `packages/ide/src/views/ide/components/language-selector.spec.tsx`
- Modify: `packages/ide/src/views/ide/components/menu.tsx`

**Step 1: Write the failing test**

Add tests covering:
- dropdown options loaded from the registry
- current selection reflecting the active saved language
- selection updating active localStorage keys and requesting the runtime customization switch

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/views/ide/components/language-selector.spec.tsx`
Expected: FAIL because the language selector does not exist yet.

**Step 3: Write minimal implementation**

Create the selector component shell and the minimum prop contract for the tests.

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/views/ide/components/language-selector.spec.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ide/src/views/ide/components/language-selector.spec.tsx packages/ide/src/views/ide/components/language-selector.tsx packages/ide/src/views/ide/components/menu.tsx
git commit -m "test: cover IDE saved language switcher"
```

### Task 10: Implement the IDE language switcher

**Files:**
- Create: `packages/ide/src/views/ide/components/language-selector.tsx`
- Modify: `packages/ide/src/views/ide/components/menu.tsx`
- Modify: `packages/ide/src/views/ide/index.tsx`
- Modify: `packages/ide/src/contexts/keyword/KeywordContext.tsx`
- Test: `packages/ide/src/views/ide/components/language-selector.spec.tsx`

**Step 1: Write the failing test**

Use the Task 9 tests as the switcher contract.

**Step 2: Run test to verify it fails**

Run: `cd packages/ide && npx vitest run src/views/ide/components/language-selector.spec.tsx`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement:
- registry-driven dropdown UI in the IDE menu
- optional image thumbnail for the active language
- selection handler that writes active storage keys and updates provider state
- a provider method or refresh path that applies a selected saved customization without remounting the full IDE

**Step 4: Run test to verify it passes**

Run: `cd packages/ide && npx vitest run src/views/ide/components/language-selector.spec.tsx`
Expected: PASS

### Task 11: Verify full saved-language flow

**Files:**
- No code changes required

**Step 1: Run targeted tests**

Run: `cd packages/ide && npx vitest run src/lib/keyword-language-storage.spec.ts src/pages/api/__tests__/language-image-search.spec.ts src/components/keyword-customizer/steps/identity-step.spec.tsx src/components/keyword-customizer/preview-data.spec.ts src/components/keyword-customizer.spec.tsx src/contexts/keyword/KeywordContext.spec.ts src/views/ide/components/language-selector.spec.tsx`
Expected: PASS

**Step 2: Run broader IDE suite**

Run: `cd packages/ide && npm test`
Expected: PASS

**Step 3: Run lint if the new route or UI code touches shared patterns**

Run: `cd packages/ide && npm run lint`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/ide/src packages/ide/env.example
git commit -m "feat: add saved language identity and IDE switching"
```
