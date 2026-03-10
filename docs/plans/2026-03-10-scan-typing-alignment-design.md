# Design: Scan Typing Alignment

## Context
Recent type-semantics work made declared `int` and `float` variables behave differently at runtime, with lossy writes into `int` warning at compile time and truncating toward zero at runtime. The `scan` statement still has an older shape: typed mode requires a leading type token, untyped mode does not support a bare identifier form, and the parsed scan type is discarded before runtime. As a result, `scan` syntax is inconsistent with the rest of the language modes and scan-triggered writes do not fully respect the new declaration-driven type semantics.

## Goals
- In typed mode, accept both `scan(int, x)` / `scan(float, x)` and `scan("%d", x)` / `scan("%f", x)`.
- In untyped mode, accept only `scan(x)`.
- Keep the declared variable type as the source of truth for runtime storage semantics.
- Emit compile-time warnings when a scan hint can cause a lossy write into an `int`.
- Truncate toward zero at runtime when a scan ultimately writes a non-integer numeric value into an `int`.

## Non-Goals
- No support for additional format strings beyond `"%d"` and `"%f"`.
- No change to the broader type system or explicit cast syntax.
- No change to string scanning behavior in this task.

## Selected Approach
Use a mode-aware parser for `scan`, preserve the optional scan hint in emitted IR, and reuse the declaration-driven coercion path already introduced for typed assignments.

This approach keeps existing typed programs compatible, adds the requested format-string syntax without replacing the token form, and avoids introducing scan-specific runtime type rules that would conflict with the rest of the compiler.

## Language Semantics

### Typed Mode
- `scan(int, x)` and `scan(float, x)` remain valid.
- `scan("%d", x)` and `scan("%f", x)` are also valid.
- Bare `scan(x)` is not valid in typed mode.

### Untyped Mode
- `scan(x)` is valid.
- `scan(int, x)`, `scan(float, x)`, `scan("%d", x)`, and `scan("%f", x)` are invalid.

### Source of Truth for Types
- The variable declaration remains authoritative for storage semantics.
- The optional scan hint describes the shape of the incoming input, not the final stored type.
- Example: `float x; scan(int, x);` reads an integer-shaped value but still stores it according to `float` declaration behavior.
- Example: `int x; scan(float, x);` warns at compile time and truncates toward zero at runtime.

## Compiler Changes

### Grammar
- Update `scanStmt` to branch on typing mode.
- In typed mode, accept either a reserved type token (`int`, `float`) or one of the supported format strings (`"%d"`, `"%f"`) before the destination identifier.
- In untyped mode, accept only a single identifier argument.

### Intermediate Representation
- Preserve the optional scan hint in the emitted `SCAN` instruction instead of discarding it.
- Normalize typed-token and format-string forms into a small internal representation so the interpreter and warning logic do not need separate code paths for each source syntax.

### Warning Emission
- Resolve the destination variable declaration type during compilation.
- If the scan hint allows fractional input and the destination variable is declared `int`, emit the same lossy-conversion warning style already used for assignments, parameter binding, and returns.
- If the scan hint is integer-shaped and the destination is `float`, do not warn.

## Runtime Changes
- Parse scan input according to the optional scan hint when present.
- After parsing, assign through the existing declaration-aware storage path.
- Integer destinations must continue truncating toward zero.
- Float destinations must preserve decimal precision even when the scan hint is integer-shaped.

## Error Handling
- Typed mode should reject unsupported scan format strings as grammar errors.
- Untyped mode should reject any scan form that includes a leading type token or format string.
- Lossy scan writes into `int` remain warnings, not errors.
- Existing runtime input failures should continue using the interpreter’s current error flow.

## Testing Strategy

### Grammar Tests
- Typed mode accepts `scan(int, x)` and `scan(float, x)`.
- Typed mode accepts `scan("%d", x)` and `scan("%f", x)`.
- Untyped mode accepts `scan(x)`.
- Untyped mode rejects typed and format-string scan forms.

### Semantic Tests
- `int x; scan(float, x);` emits a warning.
- `int x; scan("%f", x);` emits a warning.
- `float x; scan(int, x);` does not emit a warning.

### Runtime Tests
- `int` destinations truncate scanned float-like input toward zero.
- `float` destinations preserve decimal semantics even when the scan hint is integer-shaped.

## Success Criteria
- Typed mode supports both legacy type-token scan syntax and the new `"%d"` / `"%f"` forms.
- Untyped mode supports only `scan(x)`.
- Scan-triggered lossy writes into `int` produce compile-time warnings and runtime truncation.
- Declaration type remains the authoritative storage rule for scanned values.
