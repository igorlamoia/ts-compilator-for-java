# Bool And Array Frontend Design

**Date:** 2026-03-22

## Goal

Expose the recently added `bool` and vector/matrix language support in the frontend by extending the existing IDE customization flow, Monaco language metadata, and compiler config payloads.

## Scope

- Add `bool` to the frontend keyword customization and editor language metadata.
- Add `arrayMode: "fixed" | "dynamic"` to the frontend grammar configuration model.
- Expose array mode in the existing keyword customization modal.
- Keep array mode visible in untyped mode, but disable fixed-size selection with an explanation.
- Ensure IDE lexer/intermediate execution keeps forwarding the complete grammar config, including array mode.
- Update editor snippets and highlighting so they reflect bool support and the selected array mode.

## Out Of Scope

- Making `true` and `false` customizable in the modal.
- Creating a separate language-settings panel outside the existing customization modal.
- Changing compiler or interpreter semantics in this step.

## Recommended Approach

Extend the current customization architecture instead of creating a new settings surface.

This repo already stores grammar settings in the keyword customization modal, persists them through `KeywordContext`, and forwards them into lexer and intermediator execution. Adding `arrayMode` to that same path keeps the UX consistent and keeps the implementation small and coherent.

## Architecture

### Compiler Config Model

Add `arrayMode: "fixed" | "dynamic"` alongside:

- `semicolonMode`
- `blockMode`
- `typingMode`

This belongs in the IDE grammar types and in config normalization so every frontend path deals with one consolidated grammar object.

### State And Persistence

Persist `arrayMode` inside the existing keyword customization storage object in `KeywordContext`.

The default loading path should:

- read `arrayMode` from local storage when present
- fall back to a safe default when absent or invalid
- coerce invalid combinations to a valid state

### Execution Path

No new transport path is needed.

The existing `buildLexerConfig()` result already flows into:

- lexer execution
- intermediate code generation
- submission validation config normalization

Once `arrayMode` is part of the grammar object, those flows should continue working through the existing integration points.

## UX Design

### Keyword Customization Modal

Add a new section in the modal near the other grammar toggles:

- title: `Modo de Vetores e Matrizes`
- options:
  - `Tamanho fixo`
  - `Tamanho dinâmico`

Behavior:

- when `typingMode === "typed"`, both options are available
- when `typingMode === "untyped"`, keep the section visible
- in untyped mode, disable the fixed option
- show explanatory text stating that fixed-size vectors/matrices are only available in typed mode

This keeps the rule visible instead of hiding it, which makes the language constraint clearer to the user.

### Bool In The Modal

Add `bool` to the customizable keyword list and to the keyword explanation map so it behaves like the existing type keywords.

Keep `true` and `false` out of the customization modal for now.

## Editor Language Behavior

### Syntax Highlighting

Treat `bool` as a type keyword in Monaco metadata so it is highlighted the same way as `int`, `float`, `string`, and `void`.

Treat `true` and `false` as built-in language literals in Monaco tokenization/completions, even though they are not customizable.

### Snippets And Completion

Snippet availability should follow the active grammar:

- fixed mode:
  - typed declarations such as `int vetor[10];`
  - typed matrix declarations such as `int matriz[3][3];`
- dynamic mode:
  - typed declarations such as `int vetor[];`
  - typed matrix declarations such as `int matriz[][];`
  - untyped declarations such as `lista[] = [];`

Rules:

- fixed-size snippets are only shown when `typingMode === "typed"` and `arrayMode === "fixed"`
- dynamic typed snippets are shown when `typingMode === "typed"` and `arrayMode === "dynamic"`
- untyped array snippets are shown only when `typingMode === "untyped"` and `arrayMode === "dynamic"`

## Validation Rules

Frontend validation should enforce one local consistency rule:

- if `typingMode === "untyped"`, the effective `arrayMode` must be `dynamic`

Enforcement should happen in three places:

1. the modal UI prevents selecting fixed mode in untyped mode
2. state transitions coerce invalid combinations when typing mode changes
3. config normalization/loading coerces invalid persisted data

## Defaults

Use `arrayMode: "fixed"` as the frontend default unless the current interpreter/frontend execution path already assumes a different array default.

Implementation must verify the actual compiler/interpreter default and align the frontend with it exactly.

## Error Handling

Frontend behavior should fail safe:

- invalid persisted `arrayMode` falls back to default
- untyped plus fixed persisted state is normalized to dynamic
- reset-to-default restores a valid pair of `typingMode` and `arrayMode`

No separate modal error message is needed for the untyped/fixed restriction if the fixed option is disabled and the explanatory copy is present.

## Testing Strategy

Add or update tests for:

1. `KeywordContext` persistence, loading, reset, and coercion of `arrayMode`
2. `normalizeCompilerConfig()` handling of missing and invalid `arrayMode`
3. modal behavior for typed/untyped transitions and disabled fixed option
4. editor language metadata including `bool`
5. snippet filtering based on `typingMode` and `arrayMode`
6. integration hooks proving grammar payloads now include `arrayMode`

## Implementation Notes

- Reuse the existing customization modal instead of introducing a second settings panel.
- Keep `bool` customizable.
- Keep `true` and `false` built-in and non-customizable in this iteration.
- Make snippet filtering depend on both typing mode and array mode so the IDE only suggests valid declaration forms for the active grammar.
