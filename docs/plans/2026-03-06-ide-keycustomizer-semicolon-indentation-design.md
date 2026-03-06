# IDE Keycustomizer Integration Design: Semicolon + Block Mode

Date: 2026-03-06
Scope: `packages/ide` integrating compiler features from `packages/compiler`
Status: Approved

## Goal
Integrate the new compiler features into IDE API + keycustomizer pages so users can fully configure:
- semicolon mode (`optional-eol` or `required`)
- block mode (`delimited` or `indentation`)

The behavior must be user-configurable in the same spirit as current keyword and block-delimiter customization.

## Requirements
1. Add one user option for semicolon mode:
- `optional-eol`
- `required`
2. Add one user option for block style:
- `delimited`
- `indentation`
3. Keep existing customizable keywords and custom block delimiters.
4. Apply selected settings consistently across:
- lexer analysis API
- intermediate code generation API
- submission validation API
5. Persist settings in local storage with backward-compatible defaults.

## Architecture
Use the existing `KeywordContext` as the single source of truth for editor/compiler customization payload.

### Extended persisted model
Storage key: `keyword-customization`
- `mappings` (existing)
- `blockDelimiters` (existing)
- `semicolonMode`: `"optional-eol" | "required"`
- `blockMode`: `"delimited" | "indentation"`

Defaults for old storage entries:
- `semicolonMode = "optional-eol"`
- `blockMode = "delimited"`

### Context API additions
Extend context with:
- `semicolonMode`, `setSemicolonMode`
- `blockMode`, `setBlockMode`

Extend `buildLexerConfig()` to return a full compiler payload:
- `keywordMap`
- `blockDelimiters?` (only when valid and `blockMode === "delimited"`)
- `indentationBlock` (derived from `blockMode === "indentation"`)
- `grammar: { semicolonMode, blockMode }`

## API and Data Flow
Update all relevant IDE routes and call sites to pass and consume the new fields.

### Client -> API payloads
- `/api/lexer`: send `indentationBlock`, `grammar`
- `/api/intermediator`: send `grammar`
- `/api/submissions/validate`: send `indentationBlock`, `grammar`

### Server route behavior
- `pages/api/lexer.ts`
- pass `indentationBlock` into `new Lexer(...)`

- `pages/api/intermediator.ts`
- create `new TokenIterator(tokens, { locale, grammar })`

- `pages/api/submissions/validate.ts`
- lexer stage: `new Lexer(sourceCode, { ..., indentationBlock })`
- parser stage: `new TokenIterator(tokens, { grammar })`

## Keycustomizer UI
Add two settings in `keyword-customizer.tsx`:
1. Semicolon:
- Optional (`optional-eol`)
- Required (`required`)
2. Block style:
- Block delimiters (`delimited`)
- Indentation (`indentation`)

### UI rules
- If `blockMode = "indentation"`:
- delimiter inputs stay visible but disabled
- delimiter validation errors are suppressed
- delimiters are not sent in payload

- If `blockMode = "delimited"`:
- delimiter inputs are enabled and validated as today

### Save/reset behavior
- Save validates delimiters only in delimited mode
- Reset returns:
- semicolon mode to optional
- block mode to delimited
- delimiters to empty
- keywords to defaults

## Error Handling
- Reuse compiler errors directly (no custom remapping required).
- Prevent invalid IDE payload combinations by omitting block delimiters when indentation mode is selected.
- If a stale/invalid payload reaches API, compiler error is surfaced through existing toast/markers flow.

## Testing Strategy
1. Context tests
- verify `buildLexerConfig()` outputs `grammar` + `indentationBlock`
- verify `blockMode=indentation` omits `blockDelimiters`
- verify backward-compatible hydration/defaults

2. API route tests (or focused integration checks)
- `/api/lexer` forwards indentation setting
- `/api/intermediator` forwards grammar setting
- `/api/submissions/validate` forwards both settings

3. UI tests
- toggling block mode enables/disables delimiter inputs
- save/reset includes new settings

4. Manual verification
- strict semicolon mode rejects missing `;`
- optional mode accepts EOL-terminated statements
- indentation mode rejects delimiter syntax and accepts indentation syntax
- submission validation matches IDE run behavior

## Out of Scope
- Server/database persistence of these settings per user
- Refactoring settings into a separate `CompilerSettingsContext`

## Recommended Implementation Direction
Proceed with minimal-change integration by extending existing keycustomizer context and API payloads (chosen approach), then revisit context split only if complexity grows.
