# Compile Config Propagation Design

## Goal
Ensure all IDE compilation paths send and consume the same compiler configuration so lexer, grammar/intermediator, and submission validation behave consistently.

## Scope
- Align request/response contract across:
  - `POST /api/lexer`
  - `POST /api/intermediator`
  - `POST /api/submissions/validate`
- Propagate these config fields end-to-end where relevant:
  - `keywordMap`
  - `blockDelimiters`
  - `indentationBlock`
  - `grammar` (`semicolonMode`, `blockMode`)
  - `locale`

Out of scope:
- Changing compiler grammar behavior itself.
- UI redesign of the key customizer.

## Current Problem
- Frontend lexer run sends full compiler config.
- Frontend intermediator run currently sends only `tokens` and `locale`.
- Submission validation sends only partial config.
- Backend intermediator route does not accept/forward grammar config into `TokenIterator`.

Result: the same code can produce divergent behavior across compile flows depending on which endpoint is used.

## Recommended Approach
Use a shared request contract and normalization strategy for all compile endpoints.

Why this approach:
- Prevents API drift between frontend and backend.
- Keeps defaults backward-compatible for partial payloads.
- Makes behavior deterministic across analysis, intermediate generation, and submission validation.

## Contract Design
### Shared payload shape
Reuse `IDEGrammarConfig` and `IDECompilerConfigPayload` from `packages/ide/src/entities/compiler-config.ts` for route typing.

For endpoints that consume tokens (`/api/intermediator`), include:
- `tokens`
- `locale`
- `grammar`

For endpoints that consume source (`/api/lexer`, `/api/submissions/validate`), include:
- `sourceCode`
- `locale`
- full compiler config (`keywordMap`, optional `blockDelimiters`, `indentationBlock`, `grammar`)

### Normalization rules
Apply route-level normalization before compiler calls:
- `grammar.semicolonMode` default: `"optional-eol"`
- `grammar.blockMode` default: `"delimited"`
- `indentationBlock` derived/validated against `grammar.blockMode`
  - if `blockMode === "indentation"`, effective `indentationBlock = true`
  - otherwise effective `indentationBlock = false`
- Ignore block delimiters in indentation mode.

## Detailed Changes
### Frontend
- `packages/ide/src/hooks/useIntermediatorCode.ts`
  - Include `grammar` from `buildLexerConfig()` when calling `/intermediator`.
- `packages/ide/src/pages/exercises/workspace.tsx`
  - Send full compiler config to `/submissions/validate`, not only keyword map and delimiters.

### Backend
- `packages/ide/src/pages/api/intermediator.ts`
  - Extend request typing to include `grammar`.
  - Construct iterator with config: `new TokenIterator(tokens, { locale, grammar })`.
- `packages/ide/src/pages/api/submissions/validate.ts`
  - Extend request typing to include `indentationBlock`, `grammar`, `locale`.
  - Normalize config.
  - Pass normalized config into `new Lexer(sourceCode, { ... })` and `new TokenIterator(tokens, { locale, grammar })`.

### Shared typing
- `packages/ide/src/entities/compiler-config.ts`
  - Reuse existing types for request contracts.
  - If necessary, add small API-specific helper types to avoid duplicated inline route typing.

## Error Handling
- Preserve current error format and status behavior.
- Add safe fallback for missing/partial config to avoid regressions for older payloads.
- Maintain existing lexer and grammar error messages.

## Testing Strategy
1. Unit/API route checks
- `/api/intermediator` receives grammar and applies it to `TokenIterator`.
- `/api/submissions/validate` applies grammar + indentation config consistently in lexer and iterator.

2. Integration sanity paths
- Default config (`optional-eol`, `delimited`).
- Required semicolon mode (`required`).
- Indentation mode (`blockMode=indentation`).

3. Regression guard
- Existing lexer analysis flow remains unchanged.
- Existing payloads with missing new fields still compile using defaults.

## Risks and Mitigations
- Risk: route contract mismatch between frontend and backend.
  - Mitigation: centralize route payload types and avoid inline ad hoc typing.
- Risk: behavior regressions in legacy submissions.
  - Mitigation: explicit normalization defaults and backward-compatible optional fields.

## Success Criteria
- The same code and config produce consistent compile outcomes in all three flows.
- Intermediator and submission validation honor grammar/block settings sent by IDE.
- No regressions for users who have not customized compiler settings.
