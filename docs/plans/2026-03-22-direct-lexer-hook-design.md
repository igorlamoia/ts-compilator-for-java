# Direct Lexer Hook Design

**Goal:** Stop sending lexer analysis through `/api/lexer` from the IDE hook and execute the compiler `Lexer` directly inside the hook while keeping the existing hook behavior intact.

## Approved Approach

Use a small local helper inside `packages/ide/src/hooks/useLexerAnalyse.ts` that:

- Accepts the same payload data currently sent to `/api/lexer`
- Builds the effective keyword map the same way as the API route
- Instantiates `Lexer` directly with the same config fields
- Returns the same `TLexerAnalyseData` shape on success
- Re-throws `IssueError` so the hook can keep its current issue rendering and toast behavior with minimal changes
- Converts unexpected failures into a regular `Error` with the same fallback message behavior

## Why This Approach

- Smallest diff in the hook
- Preserves `analyseData`, `handleIssues`, and existing success/warning toasts
- Avoids HTTP overhead for local analysis
- Keeps response shaping local so the hook can evolve independently from Axios response semantics

## Behavioral Constraints

- Keep `analyseData` typed as `TLexerAnalyseData`
- Keep warning/info issue collection unchanged
- Keep lexer error handling aligned with current route behavior
- Keep file save behavior after successful lexer execution
- Avoid broader refactors outside `useLexerAnalyse.ts` unless required for testability
