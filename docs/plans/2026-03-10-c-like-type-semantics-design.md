# Design: C-Like Type Semantics and Customizer Validation

## Context
The compiler currently parses `int` and `float` declarations, but the interpreter executes both as plain JavaScript numbers. In practice, declared numeric types do not change runtime behavior. The IDE keyword customizer also has a validation gap where required configuration does not reliably block persistence.

Goal: make typed mode behave more like C for `int` and `float`, while preserving the current compiler pipeline and surfacing lossy conversions as compile-time warnings instead of errors.

## Goals
- Give `int` and `float` real semantics in typed mode.
- Emit compile-time warnings for lossy conversions into `int`.
- Truncate toward zero at runtime when writing a non-integer numeric value into an `int`.
- Apply the same warning/coercion rules to assignments, parameters, and return values.
- Preserve existing untyped mode behavior.
- Fix the keyword customizer so required declarations/configuration reliably trigger validation errors and block save.

## Non-Goals
- No full AST redesign.
- No full C type system.
- No explicit cast syntax in this change.
- No hard compile error for `float -> int` conversion.

## Selected Approach
Chosen approach: keep the current parser/intermediate-code architecture, add lightweight type tracking during compilation, and make runtime storage type-aware.

Reasoning:
- Solves the real bug at the storage boundary where values are assigned, passed, and returned.
- Reuses the existing compiler warning flow and IDE diagnostics.
- Avoids a larger semantic-analysis refactor while still enabling future checks.

## Language Semantics

### Numeric Types
- `int` stores truncated numeric values.
- `float` stores numeric values with decimal precision.
- `string` behavior remains unchanged.

### Lossy Conversion Rule
- If a value with possible fractional part flows into an `int`, the compiler emits a warning.
- At runtime, the stored value is truncated toward zero.

Examples:
- `int x = 3.9;` warns, stores `3`
- `int x = -3.9;` warns, stores `-3`

### Function Boundaries
- Passing a float-valued argument into an `int` parameter warns and truncates.
- Returning a float-valued expression from an `int` function warns and truncates.

## Compiler Architecture Changes (`packages/compiler`)

### Type Tracking
Add a lightweight symbol/signature environment during intermediate generation:
- variable types by scope
- parameter types
- function return types
- function parameter signature types

Add simple expression typing for:
- integer literals
- float literals
- identifiers
- arithmetic expressions
- function calls

The expression type lattice can stay minimal:
- `int`
- `float`
- `string`
- `bool`
- `unknown`

### Warning Emission
When the compiler detects a potentially lossy write into `int`, emit a warning through the existing issue pipeline instead of throwing an error.

Warning sites:
- variable assignment
- parameter binding
- function return

### Intermediate Code
Preserve the current instruction model as much as possible, but ensure declared type metadata reaches runtime for:
- declared variables
- declared parameters
- function return type handling

This can be done either by enriching `DECLARE` handling and function metadata in the iterator/interpreter boundary, or by extending emitted instructions in a minimal, backward-compatible way.

## Runtime Changes (`packages/compiler/src/interpreter`)

### Typed Storage
Store declared type alongside each variable in scope.

When a value is written:
- if target type is `int`, coerce with truncation toward zero
- if target type is `float`, store as numeric value
- otherwise preserve current behavior

The same coercion path should be reused for:
- assignments
- parameter setup on function calls
- return value propagation

## IDE/API Data Flow

### Intermediate Analysis
The intermediate-code generation flow already returns warnings/errors to the IDE. The compiler warning additions should propagate through the existing endpoint contract so the IDE can show lossy-conversion warnings without new UI architecture.

### Keyword Customizer Validation
The customizer must treat required configuration as blocking validation, not advisory text.

Expected fix:
- invalid required fields prevent save
- invalid state is surfaced inline
- state persistence only happens after validation passes

If typing mode or declaration style makes certain declaration keywords mandatory for valid programs, the customizer validation must account for that before saving.

## Error Handling
- Lossy numeric conversion into `int`: warning
- Invalid required customizer configuration: client-side validation error that blocks save
- Existing true syntax/runtime failures remain errors

## Testing Strategy

### Compiler Tests
Add tests covering:
- `int` assignment from float literal warns
- `int` assignment truncates at runtime
- `int` parameter receives float and truncates
- `int` return from float expression warns and truncates
- `float` retains decimal behavior
- existing typed/untyped grammar mode still works

### API/IDE Tests
Update API/config tests to verify:
- intermediate generation returns warnings for lossy conversions
- warning payloads continue reaching IDE consumers

### UI Tests
Add or update tests for the keyword customizer so invalid required fields block saving and surface the expected validation state.

## Success Criteria
- `int` and `float` declarations produce different runtime behavior in typed mode.
- Lossy conversion into `int` appears as a compile-time warning, not an error.
- Runtime stores truncated values for `int`.
- Warnings propagate to the IDE through existing intermediate analysis flow.
- Required keyword customizer validation blocks invalid saves.
