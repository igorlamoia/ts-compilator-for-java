# Design: Optional Typing Mode (Typed/Untyped)

## Context
The compiler already supports grammar customization for semicolons (`optional-eol` / `required`) and blocks (`delimited` / `indentation`), propagated through IDE and API routes.

Goal: increase language personalization by adding a typing choice to approximate C-like typed syntax and Python/JS-like untyped syntax.

## Goals
- Add `typingMode` with two modes:
  - `typed` (default, backward-compatible)
  - `untyped` (strict: reject explicit type syntax)
- In untyped mode, support:
  - Variable declaration keyword (e.g. `variavel x = 1`)
  - Function declaration keyword (e.g. `funcao main(a, b)`)
  - Function parameters without keyword/type (`a, b` only)
- Keep semicolon and block mode compatibility.
- Expose this in IDE keyword customization and propagate via API.

## Non-Goals
- No runtime type inference/validation.
- No hybrid mode (typed + untyped simultaneously).
- No AST redesign.

## Approach Selection
Chosen approach: explicit grammar paths by mode.

Reasoning:
- Predictable strictness in `untyped` mode.
- Lower ambiguity in parser behavior.
- Better long-term maintainability than lexer remapping hacks or single mega-rule parser.

## Compiler Architecture Changes (`packages/compiler`)

### Grammar Config
Extend `GrammarConfig` in `TokenIterator`:
- `typingMode?: "typed" | "untyped"` (default `"typed"`)

### Reserved Keywords
Add reserved entries for untyped declarations:
- `variavel`
- `funcao`

They remain customizable via `keywordMap` in lexer.

### Parser Flow
Introduce mode-aware parsing branches:
- `typed`:
  - function declaration: `<type> IDENT '(' <typedParamList> ')' <block>`
  - variable declaration: `<type> IDENT ...`
- `untyped`:
  - function declaration: `funcKeyword IDENT '(' <untypedParamList> ')' <block>`
  - variable declaration: `varKeyword IDENT [= expr] (, IDENT [= expr])*`
  - params: `IDENT (',' IDENT)*`

Key parser files impacted:
- `grammar/syntax/function-call.ts`
- `grammar/syntax/declarationStmt.ts`
- `grammar/syntax/parameterListStmt.ts`
- `grammar/syntax/stmt.ts`
- `grammar/syntax/typeStmt.ts` (or type checks moved to mode-specific helpers)

### Strict Rejection Rules (`untyped`)
In untyped mode, explicit type tokens in declaration/signature context must raise grammar errors:
- reject `int/float/string/void` in function declaration header
- reject typed variable declarations
- reject typed parameters

## Data Flow (IDE -> API -> Compiler)

### IDE
- Add `IDETypingMode` to compiler config entities.
- `normalizeCompilerConfig` includes `typingMode` defaulting to `typed`.
- `KeywordContext` persists and exposes `typingMode` in localStorage.
- `KeywordCustomizer` adds UI control:
  - `Tipado`
  - `Não tipado`
- `buildLexerConfig()` returns grammar with `typingMode`.

### API
- `/api/intermediator`: accept and pass `grammar.typingMode` to `TokenIterator`.
- `/api/submissions/validate`: normalize and forward `typingMode` to `TokenIterator`.
- `/api/lexer`: may accept `typingMode` in payload for contract symmetry (no lexer behavioral dependency required).

## Error Handling
- Add/extend grammar i18n messages for invalid typed constructs in untyped mode.
- Keep existing error format (`IssueError` details) for line/column consistency in IDE markers.

## Testing Strategy (TDD)

### 1) Compiler-first tests (`packages/compiler`)
Create/extend grammar tests (e.g. `typing-mode.spec.ts`) with red-first cycle:
- `typed` accepts current syntax.
- `untyped` accepts `funcao main(a)` and `variavel x = 1`.
- `untyped` rejects:
  - `int main()`
  - `int x = 1;`
  - `funcao soma(int a)`
- Compatibility with `semicolonMode` and `blockMode` in both typing modes.

### 2) IDE/API config tests
Update existing tests to assert `typingMode` propagation:
- `src/lib/compiler-config.spec.ts`
- `src/pages/api/__tests__/intermediator-config.spec.ts`
- `src/pages/api/__tests__/submission-config.spec.ts`

### 3) Green + Refactor
- Implement minimal parser/config changes to satisfy tests.
- Refactor shared helpers after green state.

## Compatibility & Migration
- Default remains `typed`; existing projects continue unchanged.
- Existing localStorage entries without `typingMode` fall back to `typed`.
- API requests without `typingMode` normalize to `typed`.

## Success Criteria
- User can toggle typing mode in IDE customizer.
- Compiler enforces strict typed/untyped grammar according to mode.
- API routes preserve mode end-to-end.
- All updated tests pass.
