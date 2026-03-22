# Direct Intermediator Hook Design

**Goal:** Stop sending intermediate code generation through `/api/intermediator` from the IDE hook and execute the compiler `TokenIterator` directly inside the hook while keeping the existing hook behavior intact.

## Approved Approach

Use a small local helper inside `packages/ide/src/hooks/useIntermediatorCode.ts` that:

- Accepts the same payload data currently sent to `/api/intermediator`
- Instantiates `TokenIterator` directly with the same config fields
- Returns the same `TIntermediateCodeData` shape on success
- Re-throws `IssueError` so the hook can keep its current issue rendering and toast behavior with minimal changes
- Converts unexpected failures into a regular `Error` with the same fallback message behavior

## Why This Approach

- Smallest diff in the hook
- Preserves `intermediateCode`, `handleIssues`, and existing success/warning toasts
- Avoids HTTP overhead for local intermediate code generation
- Keeps response shaping local so the hook can evolve independently from Axios response semantics

## Behavioral Constraints

- Keep `intermediateCode` typed as `TIntermediateCodeData`
- Keep warning/info issue collection unchanged
- Keep iterator error handling aligned with current route behavior
- Keep file save behavior after successful intermediate code generation
- Avoid broader refactors outside `useIntermediatorCode.ts` unless required for testability
