# KeywordCustomizer Refactor Design

**Date:** 2026-03-29

## Goal

Refactor `KeywordCustomizer` so the shell component stops coordinating every field and step directly. Keep step components prop-driven, but reduce each step to a small, step-specific prop surface. Introduce a separate internal context for wizard navigation and session state when that improves composition and removes unrelated props.

## Current Problems

- `src/components/keyword-customizer.tsx` owns draft state, validation, preset application, navigation, save/reset logic, preview construction, and all per-step handlers.
- Step components in `src/components/keyword-customizer/steps` are mostly presentational but still receive many unrelated props.
- Per-step behavior is tightly coupled to central handlers such as `handleKeywordChange`, `handleDocumentationChange`, `handleDelimiterChange`, and mode-specific inline callbacks.
- Validation and step transitions are mixed into rendering, making the shell large and harder to evolve.

## Design Summary

The refactor will keep step components prop-driven while splitting orchestration into focused modules:

- A new internal provider will manage wizard session concerns:
  - active step
  - visited steps
  - selected preset
  - session base customization for preset resets
  - preview state derived from the current draft
  - shared navigation helpers
- Draft customization state and sync helpers will be centralized behind small update functions rather than many ad hoc callbacks.
- Step props will be grouped by responsibility so each step receives compact objects such as:
  - `values`
  - `documentation`
  - `errors`
  - `actions`
- Validation logic will move out of the render-heavy shell into dedicated helpers that validate:
  - per-step transitions
  - full save/apply flow

## Architecture

### 1. Shell component

`src/components/keyword-customizer.tsx` becomes a composition layer responsible for:

- mounting the form shell and layout
- reading current wizard state from the internal wizard context
- selecting the active step component
- wiring navigation buttons to wizard actions

It should not hold large inline handlers for every field.

### 2. Internal wizard context

Add an internal provider under `src/components/keyword-customizer/` to own wizard-only session state. This context is not a replacement for the existing keyword customization context. It is local to the customizer flow.

Responsibilities:

- expose current step metadata
- move between steps
- track visited steps
- apply presets relative to the session base state
- reset the draft and wizard session
- surface the active step error

This keeps shell composition small without forcing every step to consume context directly.

### 3. Draft sync actions

Create focused sync helpers for the customization draft:

- `syncKeyword(original, value)`
- `syncDocumentation(id, value)`
- `syncMode(key, value)`
- `syncDelimiter(field, value)`
- `syncBooleanLiteral(field, value)`
- `syncOperatorWord(field, value)`
- `syncStatementTerminator(value)`

These helpers update only the relevant draft slice and maintain related validation state. Step components will receive only the helpers they need.

### 4. Step prop builders

Build step props in a dedicated module so the shell does not manually construct every prop inline. Each step receives compact grouped props scoped to its domain:

- Identity: selected preset + preset action
- Variables: visible values, documentation values, typing/array modes, sync actions
- Structure: structure values, relevant errors, sync actions
- Rules: literal/operator values, relevant errors, sync actions
- Flow: keyword values, documentation, sync actions
- Review: preview data, visited steps, navigation back to specific steps

### 5. Validation helpers

Move transition and save validation into dedicated helpers. The shell and wizard context will ask these helpers:

- whether the current step can advance
- which step should be focused on save failure
- which message should be shown for the active step

This keeps validation consistent and reduces duplicated decision logic.

## Component Boundaries

### Keep

- Existing step components in `src/components/keyword-customizer/steps`
- Existing preview builder and preview panel
- Existing wizard model
- Existing keyword domain context in `src/contexts/keyword/KeywordContext.tsx`

### Add

- internal wizard provider/context
- customization draft sync helper module
- validation helper module
- step prop builder module
- possibly smaller shared types for grouped step props

## Data Flow

1. Read persisted customization from `useKeywords()`
2. Initialize local draft customization from that persisted state
3. Internal wizard provider derives preview and session state from the draft
4. Shell asks prop-builder helpers for the active step props
5. Step components call small sync functions passed in props
6. Save flow validates the full draft, normalizes it, persists via `setCustomization`, then exits

## Error Handling

- Step-local validation errors remain scoped to the relevant step
- Navigation blocks only when the active step has invalid required data
- Save can still validate the entire draft and redirect the user to the failing step
- Errors should be surfaced through a single active-step error area in the shell

## Testing Strategy

Keep the existing integration-style coverage in `src/components/keyword-customizer.spec.tsx` and expand only where the refactor introduces new behavior boundaries:

- step navigation still works
- presets still reset from the session base instead of accumulating aliases
- typed/untyped variable vocabulary still changes correctly
- validation still blocks navigation/save on the same step boundaries

Where useful, add small unit tests for extracted pure helpers such as prop builders or validation helpers, but avoid over-testing implementation detail.

## Tradeoffs

### Why not move all state to context?

That would shrink prop lists even more, but it would make the data flow less explicit and go against the approved requirement to keep step props.

### Why add a wizard context at all?

Because step navigation and wizard session state are cross-cutting concerns shared by the shell, review step, stepper, and footer controls. A focused internal context removes plumbing without making step fields opaque.

## Success Criteria

- `src/components/keyword-customizer.tsx` is substantially smaller and mostly declarative
- step components receive compact grouped props instead of many unrelated callbacks
- wizard session state is isolated from per-field draft sync logic
- current behavior and existing tests remain green
