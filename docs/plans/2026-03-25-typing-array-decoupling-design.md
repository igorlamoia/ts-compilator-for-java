# Design: Typing and Array Mode Decoupling

## Context
The project already supports `typingMode` (`typed` or `untyped`) and `arrayMode` (`fixed` or `dynamic`) across compiler and IDE configuration. Today, the IDE normalization and customization flow still couples these settings by forcing `arrayMode = "dynamic"` whenever `typingMode = "untyped"`.

The language rules also need a finer distinction in typed mode: variables must be explicitly typed at declaration time, but assignments to variables that were already declared in scope must remain valid.

## Goals
- Make `typingMode` and `arrayMode` fully independent configuration choices.
- In `typed` mode, require explicit typing when declaring a new variable.
- In `typed` mode, continue accepting assignments to identifiers that were already declared in scope.
- In `untyped` mode, continue rejecting explicit type syntax in declarations and signatures.
- Allow array declaration syntax in untyped mode based on `arrayMode`, without forcing dynamic arrays.
- Allow empty array initialization `= []` for valid typed and untyped array declarations.

## Non-Goals
- No new hybrid typing mode.
- No runtime type inference beyond current behavior.
- No redesign of IR or interpreter architecture outside what existing array support already needs.

## Approach Selection

### 1. Recommended: Decouple typing rules from array-shape rules
- `typingMode` decides whether declarations require explicit types.
- `arrayMode` decides whether array dimensions are written as `[N]` or `[]`.
- Parser branches stay explicit and mode-aware.

Why this is recommended:
- Matches the requested language model exactly.
- Removes hidden frontend normalization behavior.
- Keeps grammar decisions predictable and testable.

### 2. Partial frontend-only decoupling
- Remove IDE coercion but keep most parser assumptions intact.

Trade-off:
- Smaller immediate change.
- Risks mismatches between UI, API payloads, and compiler behavior.

### 3. Add a separate flag just for explicit variable typing
- Example: `requireExplicitVariableTypesInTypedMode`.

Trade-off:
- Solves only part of the problem.
- Adds redundant configuration instead of making existing modes behave correctly.

Chosen approach: **Option 1**

## Language Rules

### Typing Mode

#### `typingMode = "typed"`
- Variable declarations must include an explicit type.
- Example: `int x = 1;`
- `x = 1;` is valid only if `x` was already declared in an accessible scope.
- `x = 1;` must not be treated as an implicit declaration.
- Function declarations and parameters continue using typed syntax.

#### `typingMode = "untyped"`
- Variable declarations must not include explicit types.
- Scalar declaration syntax remains `variavel x = 1;`.
- Function declarations and parameters continue using untyped syntax.
- Explicit type tokens in declaration/signature positions remain grammar errors.

### Array Mode

#### `arrayMode = "fixed"`
- Array declarations accept only explicit sizes in every dimension.
- Typed example: `int lista[10] = [];`
- Untyped example: `lista[10] = [];`
- Reject `[]` declarations such as `int lista[];` or `lista[] = [];`

#### `arrayMode = "dynamic"`
- Array declarations accept only empty dimensions.
- Typed example: `int lista[] = [];`
- Untyped example: `lista[] = [];`
- Reject fixed-size declarations such as `int lista[10];` or `lista[10] = [];`

### Combined Behavior Matrix
- `typed + fixed`: typed scalar declarations plus fixed arrays
- `typed + dynamic`: typed scalar declarations plus dynamic arrays
- `untyped + fixed`: untyped scalar declarations plus fixed arrays
- `untyped + dynamic`: untyped scalar declarations plus dynamic arrays

## Compiler Architecture

### Parser Responsibilities
- `typingMode` must control only declaration syntax for scalars/functions/parameters.
- `arrayMode` must control only array dimension syntax.
- Untyped array declarations without the `variavel` keyword remain supported, but must branch on `arrayMode`:
  - `fixed`: `ident[10] = []`
  - `dynamic`: `ident[] = []`
- Typed array declarations continue through the regular declaration path and may be initialized with `[]` when the declaration shape matches the configured `arrayMode`.

### Declaration and Assignment Semantics
- In typed mode, a statement starting with an identifier remains an assignment/function-call path, not a declaration path.
- Assignment must succeed if the identifier already resolves in scope.
- If the identifier is unknown, the current invalid-assignment/unknown-symbol failure path should remain the enforcement mechanism rather than silently creating a variable.

## IDE and API Flow

### IDE
- Remove normalization that coerces `untyped` to `dynamic`.
- Preserve any valid `typingMode` + `arrayMode` combination in saved customization state.
- Do not disable array-mode controls when untyped mode is selected.
- Snippet filtering must continue to consider both modes, but independently.

### API
- `normalizeCompilerConfig` must preserve user-supplied `arrayMode` regardless of `typingMode`.
- Submission and intermediator routes must forward both values as provided after basic validation/defaulting.

## Error Handling
- `typed`: reject implicit variable declaration attempts by keeping identifier-led statements on the assignment path.
- `untyped`: reject explicit type syntax in declarations and signatures.
- `fixed`: reject empty dimensions `[]`.
- `dynamic`: reject sized dimensions `[N]`.
- Preserve existing errors for invalid index counts, invalid assignment targets, and unexpected type usage.

## Testing Strategy

### Compiler Tests
- `typed + fixed`
  - accept `int lista[10] = [];`
  - reject `int lista[] = [];`
  - reject implicit declaration via `x = 1;` when `x` is undeclared
  - accept `x = 1;` after `int x;`
- `typed + dynamic`
  - accept `int lista[] = [];`
  - reject `int lista[10] = [];`
- `untyped + fixed`
  - accept `lista[10] = [];`
  - reject `lista[] = [];`
  - reject `int lista[10] = [];`
- `untyped + dynamic`
  - accept `lista[] = [];`
  - reject `lista[10] = [];`

### IDE Tests
- compiler config normalization preserves all valid combinations
- keyword customization state load/save preserves all valid combinations
- array-mode UI remains enabled in untyped mode
- snippet availability depends on `arrayMode` independently of `typingMode`

## Success Criteria
- `typingMode` no longer changes `arrayMode`.
- Typed mode requires explicit type syntax for new variable declarations.
- Typed mode still allows assignment to already declared identifiers.
- Untyped mode supports fixed or dynamic arrays based only on `arrayMode`.
- Empty array initialization `= []` works for the approved typed and untyped array forms.
