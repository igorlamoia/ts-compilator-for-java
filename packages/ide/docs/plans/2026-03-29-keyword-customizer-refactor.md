# KeywordCustomizer Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor `KeywordCustomizer` into a smaller shell that uses grouped step props and an internal wizard context without changing current behavior.

**Architecture:** Keep the existing domain customization state in `useKeywords()`, but move wizard/session coordination into a new local provider under `src/components/keyword-customizer/`. Extract pure helper modules for draft sync, validation, and grouped step-prop assembly so each step receives a compact, step-specific API instead of many unrelated callbacks.

**Tech Stack:** Next.js, React 19, TypeScript, react-hook-form, Vitest, jsdom

---

### Task 1: Lock the current customizer behavior with tests

**Files:**
- Modify: `src/components/keyword-customizer.spec.tsx`
- Test: `src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Add or tighten tests in `src/components/keyword-customizer.spec.tsx` that cover the refactor boundaries:

- moving between steps via the side navigation
- applying presets from the clean session base
- switching between typed and untyped variables
- blocking progression when a structure or rules validation error exists

Use the existing render helpers and mocked `useKeywords()` context instead of introducing new infrastructure.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: at least one new assertion fails because the behavior is not yet wired through the refactored modules.

**Step 3: Write minimal implementation**

Do not change production code yet beyond the minimum needed to keep the new assertions meaningful. If a test was too broad and passes immediately, narrow the assertion until it proves a refactor boundary.

**Step 4: Run test to verify it passes or fails for the right reason**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: the suite fails only on the new behavior you intend to preserve during the refactor.

**Step 5: Commit**

```bash
git add src/components/keyword-customizer.spec.tsx
git commit -m "test: lock keyword customizer refactor behavior"
```

### Task 2: Extract wizard session state into a local provider

**Files:**
- Create: `src/components/keyword-customizer/keyword-customizer-context.tsx`
- Create: `src/components/keyword-customizer/keyword-customizer-types.ts`
- Modify: `src/components/keyword-customizer.tsx`
- Test: `src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Add a test that depends on wizard session behavior staying stable through extraction, for example:

- preset selection updates the preview without breaking step navigation
- visited steps remain available in review after direct navigation

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: FAIL because the new context-backed wiring does not exist yet.

**Step 3: Write minimal implementation**

Implement `keyword-customizer-context.tsx` with:

- active step id
- visited step ids
- selected preset id
- wizard session base customization
- navigation helpers: `goToStep`, `goNext`, `goBack`
- preset helper: `applyPreset`
- reset helper for wizard/session state

Keep draft customization itself in the customizer layer, but let the provider coordinate wizard state around it.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: PASS for the new wizard-session assertions.

**Step 5: Commit**

```bash
git add src/components/keyword-customizer/keyword-customizer-context.tsx src/components/keyword-customizer/keyword-customizer-types.ts src/components/keyword-customizer.tsx src/components/keyword-customizer.spec.tsx
git commit -m "refactor: extract keyword customizer wizard context"
```

### Task 3: Extract draft sync and validation helpers

**Files:**
- Create: `src/components/keyword-customizer/keyword-customizer-actions.ts`
- Create: `src/components/keyword-customizer/keyword-customizer-validation.ts`
- Modify: `src/components/keyword-customizer.tsx`
- Test: `src/components/keyword-customizer.spec.tsx`
- Test: `src/components/keyword-customizer/wizard-model.spec.ts` if helper coverage naturally fits there

**Step 1: Write the failing test**

Add or adjust a test for one blocked transition and one save-path validation case, such as:

- structure step refuses to continue when delimiters are invalid
- rules step refuses to continue when operator aliases conflict

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: FAIL because the extracted validation helpers are not wired yet.

**Step 3: Write minimal implementation**

Create:

- `keyword-customizer-actions.ts` with focused sync functions:
  - `syncKeyword`
  - `syncDocumentation`
  - `syncMode`
  - `syncDelimiter`
  - `syncBooleanLiteral`
  - `syncOperatorWord`
  - `syncStatementTerminator`
- `keyword-customizer-validation.ts` with pure helpers for:
  - current step error selection
  - advance validation
  - full save validation and failing step resolution

Use existing validators from:

- `@/contexts/keyword/keyword-validator`
- `@/lib/operator-word-map`

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: PASS with the same user-visible validation behavior.

**Step 5: Commit**

```bash
git add src/components/keyword-customizer/keyword-customizer-actions.ts src/components/keyword-customizer/keyword-customizer-validation.ts src/components/keyword-customizer.tsx src/components/keyword-customizer.spec.tsx
git commit -m "refactor: extract keyword customizer sync and validation helpers"
```

### Task 4: Shrink step interfaces with grouped prop builders

**Files:**
- Create: `src/components/keyword-customizer/keyword-customizer-step-props.ts`
- Modify: `src/components/keyword-customizer/steps/identity-step.tsx`
- Modify: `src/components/keyword-customizer/steps/variables-step.tsx`
- Modify: `src/components/keyword-customizer/steps/structure-step.tsx`
- Modify: `src/components/keyword-customizer/steps/rules-step.tsx`
- Modify: `src/components/keyword-customizer/steps/flow-step.tsx`
- Modify: `src/components/keyword-customizer/steps/review-step.tsx`
- Modify: `src/components/keyword-customizer.tsx`
- Test: `src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Add a narrow regression test that exercises one step after the grouped prop rewrite, for example:

- clicking typed mode still reveals `bool`
- clicking a review chip still returns to that step

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: FAIL because the step prop shape has changed but the UI is not fully rewired yet.

**Step 3: Write minimal implementation**

Create `keyword-customizer-step-props.ts` that assembles compact step-specific props from:

- draft customization
- documentation map
- step-local errors
- sync helpers
- wizard navigation state

Rewrite step prop types to grouped objects such as:

- `values`
- `errors`
- `actions`

Keep the steps prop-driven. Do not make the steps consume the new wizard context directly unless a step needs wizard-only state such as visited steps in review.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: PASS with unchanged rendered behavior.

**Step 5: Commit**

```bash
git add src/components/keyword-customizer/keyword-customizer-step-props.ts src/components/keyword-customizer/steps/identity-step.tsx src/components/keyword-customizer/steps/variables-step.tsx src/components/keyword-customizer/steps/structure-step.tsx src/components/keyword-customizer/steps/rules-step.tsx src/components/keyword-customizer/steps/flow-step.tsx src/components/keyword-customizer/steps/review-step.tsx src/components/keyword-customizer.tsx src/components/keyword-customizer.spec.tsx
git commit -m "refactor: group keyword customizer step props"
```

### Task 5: Reduce the shell to layout and composition

**Files:**
- Modify: `src/components/keyword-customizer.tsx`
- Test: `src/components/keyword-customizer.spec.tsx`

**Step 1: Write the failing test**

Add one final end-to-end style assertion around the full shell flow:

- navigate across steps
- save the customization
- ensure `setCustomization` is called with normalized values

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: FAIL because the shell is not yet fully delegated to the extracted modules.

**Step 3: Write minimal implementation**

Finish trimming `src/components/keyword-customizer.tsx` so it only:

- initializes the form and draft state
- renders the header, stepper, active step, preview, and footer
- delegates wizard/session behavior to the internal provider
- delegates step wiring to grouped prop builders
- delegates validation/save branching to helper modules

Keep save normalization behavior unchanged.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx
```

Expected: PASS with no regression in the customizer flow.

**Step 5: Commit**

```bash
git add src/components/keyword-customizer.tsx src/components/keyword-customizer.spec.tsx
git commit -m "refactor: simplify keyword customizer shell"
```

### Task 6: Run focused verification and clean up

**Files:**
- Test: `src/components/keyword-customizer.spec.tsx`
- Test: `src/components/keyword-customizer/preview-data.spec.ts`
- Test: `src/components/keyword-customizer/wizard-model.spec.ts`

**Step 1: Run focused test suite**

Run:

```bash
npm test -- src/components/keyword-customizer.spec.tsx src/components/keyword-customizer/preview-data.spec.ts src/components/keyword-customizer/wizard-model.spec.ts
```

Expected: PASS for all customizer-related suites.

**Step 2: Run lint only if refactor changed lint-sensitive patterns**

Run:

```bash
npm run lint
```

Expected: PASS, or existing unrelated lint failures only.

**Step 3: Review diffs**

Run:

```bash
git diff -- src/components/keyword-customizer.tsx src/components/keyword-customizer src/components/keyword-customizer.spec.tsx
```

Expected: a smaller shell, new helper modules, and reduced step prop surfaces without behavior drift.

**Step 4: Commit**

```bash
git add src/components/keyword-customizer.tsx src/components/keyword-customizer src/components/keyword-customizer.spec.tsx
git commit -m "test: verify keyword customizer refactor"
```
