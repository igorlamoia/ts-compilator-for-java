# IDE Keyword Map Merge Design (Switch + Submission API)

Date: 2026-03-05
Scope: `packages/ide` (keyword customizer + API integration)

## Context
The compiler backend now supports `switch/case/default`. In IDE, keyword customization is per-user (localStorage) and sends mappings to `/api/lexer`, but submit validation (`/api/submissions/validate`) currently compiles without custom keyword map. Also, frontend keyword customizer currently misses switch-related keys.

This causes inconsistencies and failures when frontend mapping is partial or missing newly added backend grammar keys.

## Requirements (Validated)
1. Per-user customization only for now.
2. `switch`, `case`, `default` must be customizable in frontend.
3. Backend must merge default grammar keywords with frontend overrides.
4. If frontend sends nothing, system must still work with defaults.
5. Frontend should only override grammar keys; backend defaults remain canonical.

## Core Design

### 1) Canonical merge rule on backend
For endpoints that compile source code:

```ts
effectiveKeywordMap = {
  ...TOKENS.RESERVEDS,
  ...(keywordMapFromRequest ?? {}),
};
```

Behavior:
- Missing `keywordMap`: defaults only.
- Partial overrides: merged with defaults.
- Full overrides: frontend values take precedence where provided.

### 2) Frontend supports switch-family keywords
Update customizable keyword catalog to include:
- `switch`
- `case`
- `default`

This updates both the form flow and emitted keyword map.

### 3) Submission API uses user keyword map
`/api/submissions/validate` accepts optional `keywordMap` and compiles using merged effective map, matching IDE lexer behavior.

## Component-Level Changes

### Frontend
1. `KeywordContext`
- Expand `CUSTOMIZABLE_KEYWORDS` with switch-family token IDs.
- Keep `buildKeywordMap()` contract unchanged.

2. `KeywordCustomizer`
- Add UX explanations for `switch/case/default`.
- No structural UI redesign required; existing stepper flow remains.

3. Exercise submission flow
- In workspace submit action, send `keywordMap: buildKeywordMap()` with `sourceCode` to `/submissions/validate`.

### Backend
1. `/api/lexer`
- Normalize handling by merging request map with default reserved tokens before creating lexer.

2. `/api/submissions/validate`
- Accept `keywordMap` in request body.
- Merge with default reserved tokens.
- Use merged map in `new Lexer(sourceCode, effectiveKeywordMap)`.

## Error Handling and Safety
1. If request `keywordMap` is absent or empty, default grammar works.
2. If request `keywordMap` is partial, unprovided defaults still work.
3. If request has malformed entries, ignore invalid entries and continue with valid/default merge.
4. Preserve existing API error shape and current `IssueError` handling.

## Testing Strategy

### API/behavior tests
1. `/api/submissions/validate` without `keywordMap`: compile switch code successfully.
2. `/api/submissions/validate` with partial `keywordMap`: switch still compiles.
3. `/api/submissions/validate` with switch override: custom switch lexeme compiles.
4. Malformed entries in `keywordMap`: no crash; fallback behavior preserved.

### Frontend checks
1. Keyword customizer includes `switch/case/default` steps.
2. `buildKeywordMap()` includes customized switch-family entries.
3. Submit request payload includes `keywordMap`.

### End-to-end parity
- Same code + same mapping should produce consistent compile outcomes in lexer run and compile/submit path.

## Out of Scope
1. Persisting mappings in database.
2. Teacher/class forced mappings.
3. Mapping precedence policies beyond per-user local overrides.

## Success Criteria
1. Default grammar works with no custom map.
2. User overrides work for `switch/case/default`.
3. Submission validation behavior matches IDE analysis behavior.
4. No regressions for existing customized commands.
