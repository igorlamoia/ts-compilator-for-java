# Keyword Context Refactor Design

## Context

`KeywordContext` already persists a single `keyword-customization` object in localStorage, but its runtime model is still fragmented across many independent `useState` calls and many field-specific setters.

The main consumer, `packages/ide/src/components/keyword-customizer.tsx`, mirrors nearly the full context into separate draft states and saves by calling many setters in sequence. Smaller consumers mostly need only a few derived capabilities such as:

- the active keyword mappings
- compiler payload generation through `buildLexerConfig()`
- modal open/close control

The requested refactor is to make the runtime model match the persisted model: one larger context object that holds mappings, modes, and modal control together, with only a few grouped setters.

## Goals

- Replace fragmented `KeywordContext` state with one canonical object.
- Move grammar modes into a nested shared object instead of separate top-level fields.
- Move keyword customizer modal state into that same context object.
- Reduce the context API to a few grouped setters instead of many field-specific setters.
- Refactor `keyword-customizer` to edit one draft object instead of mirroring many independent context fields.
- Keep existing validation behavior and compiler payload behavior intact unless the refactor exposes an existing bug.

## Non-Goals

- Do not preserve backward compatibility for the old flat context API.
- Do not redesign the user-facing customizer flow or add new customization features.
- Do not replace the current validation rules/messages unless needed to keep behavior correct after consolidation.

## Options Considered

### Option 1: Single state object plus grouped patch actions

Keep one canonical state object in the provider, shaped close to persisted storage, and expose a small API around grouped updates.

Pros:

- Matches the requested direction directly.
- Removes duplicated translation between storage shape and runtime shape.
- Makes persistence, Monaco syncing, and customizer save/reset logic depend on one source of truth.
- Keeps consumer code straightforward without reducer ceremony.

Cons:

- Breaks all current flat destructuring sites.
- Requires careful migration of tests and mocks.

### Option 2: Single reducer with explicit actions

Model the whole context as a reducer with actions such as `SET_MODES`, `SET_CUSTOMIZATION`, `RESET_ALL`, and `OPEN_CUSTOMIZER`.

Pros:

- Strong internal discipline.
- Explicit state transitions.

Cons:

- Heavier than necessary for this scope.
- Adds boilerplate to simple updates and consumer mocks.

### Option 3: Single context value with separate `compilerCustomization` and `ui`

Keep one context provider but split the top-level object into two distinct branches with separate mental models.

Pros:

- Clearer separation of concerns.

Cons:

- Conflicts with the goal of keeping modes and modal control in the same unified object.
- Still encourages consumers to think in separate state domains.

## Chosen Approach

Choose Option 1: a single canonical customization object plus a few grouped setters.

This best matches the requested refactor:

- one larger object
- fewer states
- fewer setters
- storage shape and runtime shape aligned

## State Shape

The provider should own one top-level state object, exported as `customization`.

Recommended shape:

```ts
type KeywordCustomizationState = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme: string;
  blockDelimiters: BlockDelimiters;
  modes: {
    semicolon: IDESemicolonMode;
    block: IDEBlockMode;
    typing: IDETypingMode;
    array: IDEArrayMode;
  };
  ui: {
    isKeywordCustomizerOpen: boolean;
  };
};
```

This replaces the current flat runtime fields such as:

- `semicolonMode`
- `blockMode`
- `typingMode`
- `arrayMode`
- `isOpenKeywordCustomizer`

with nested paths:

- `customization.modes.semicolon`
- `customization.modes.block`
- `customization.modes.typing`
- `customization.modes.array`
- `customization.ui.isKeywordCustomizerOpen`

## Provider API

The context should stop exporting many field-level values and setters. It should instead expose:

- `customization`
- `setCustomization(nextOrUpdater)`
- `setModes(nextOrUpdater)`
- `setUi(nextOrUpdater)`
- `setMappings(nextOrUpdater)` or `updateKeyword(original, custom)`
- `resetCustomization()`
- `buildKeywordMap()`
- `buildLexerConfig()`
- validation helpers

The grouped setter behavior should be:

- `setCustomization` updates the full state object
- `setModes` updates only `customization.modes`
- `setUi` updates only `customization.ui`
- `setMappings` updates only `customization.mappings`

Helpers such as `updateKeyword(original, custom)` may stay if they still simplify the main customizer flow, but they should be implemented as focused updates on the canonical object rather than independent state setters.

## Persistence And Hydration

Hydration should load one object and normalize it into the new shape.

Rules:

- Read `keyword-customization` first.
- Normalize current stored flat fields into nested `modes` and `ui`.
- If only legacy `keyword-mappings` exists, migrate it into the new full object using defaults for all other fields.
- Persist the normalized result back immediately so localStorage converges to the new shape.

Persistence should always write the full canonical object and should no longer reconstruct it from many independent pieces.

## Monaco And Derived Data

Monaco keyword updates and retokenization should depend on the single customization object rather than a long list of fragmented dependencies.

The provider should derive:

- `buildKeywordMap()` from `customization.mappings`
- `buildLexerConfig()` from `customization`

`buildLexerConfig()` should keep the current external payload contract, but derive grammar from `customization.modes`:

```ts
grammar: {
  semicolonMode: customization.modes.semicolon,
  blockMode: customization.modes.block,
  typingMode: customization.modes.typing,
  arrayMode: customization.modes.array,
}
```

Modal open/close should also derive from the same canonical object through `customization.ui.isKeywordCustomizerOpen`.

## Keyword Customizer Refactor

`packages/ide/src/components/keyword-customizer.tsx` should stop mirroring context into many separate draft states.

Instead, it should keep one `draftCustomization` object copied from `customization` when the modal opens.

Expected behavior:

- all input handlers update fields on `draftCustomization`
- all validation reads from a coherent draft snapshot
- save writes back through grouped setters or one full-state setter
- reset restores default draft state without issuing many sequential context setter calls

This removes the current pattern where save/reset has to coordinate many separate context updates.

## Validation Strategy

Validation helpers should remain pure, but they should validate against one coherent customization snapshot or the exact slices derived from that snapshot.

The refactor should preserve current validation rules and current user-facing messages where possible.

The main structural change is that validation during modal editing should no longer mix old committed context values with new draft values across separate state variables.

## Consumer Changes

Consumers should migrate to the new shape as follows:

- token views read `customization.mappings`
- side menu opens the modal through `setUi(...)`
- lexer and intermediator hooks continue to rely on `buildLexerConfig()`
- any future customization surface should work from the unified object shape

No compatibility wrapper is required.

## Testing Strategy

Update tests around the new break points:

### KeywordContext tests

- load and migration into the nested state shape
- reset behavior
- grouped setter behavior
- `buildLexerConfig()` using `customization.modes`

### Keyword customizer tests

- mocks updated to provide `customization` plus grouped setters
- save path writes the consolidated draft through the new API
- reset path uses the unified state model

### Integration confidence

- at least one provider test proving `setModes` changes `buildLexerConfig().grammar`
- preserve hook-level confidence for consumers that use `buildLexerConfig()`

## Risks

- Breaking all current context consumers at once without a compatibility layer increases the need for careful test updates.
- Partial migration logic could silently drop stored values if normalization is incomplete.
- The customizer refactor may accidentally change validation timing unless draft handling is kept consistent.

## Success Criteria

- `KeywordContext` uses one canonical runtime object instead of many independent state variables.
- Modes and modal control live inside that object.
- The exposed API is reduced to a few grouped setters.
- `keyword-customizer` edits one draft object and saves without many field-level setter calls.
- Existing lexer/intermediator payload behavior remains correct through `buildLexerConfig()`.
