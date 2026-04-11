# Space Background Mascot Marquee Design

**Date:** 2026-04-11

## Goal

Extend the fixed `SpaceBackground` so it can display the PNG assets in `packages/ide/public/images` through a dedicated marquee-style mascot component:

- one image crossing the screen at a time
- randomized idle delay between passes
- alternating left-to-right and right-to-left motion
- slow rotation on the mascot image while it is crossing the screen
- low visual weight so the background stays subordinate to the main content

## Context

Today `packages/ide/src/components/space-background.tsx` renders only the gradient background plus the `Meteors` and `Particles` layers. The `cb.png` and `ein.png` assets already exist in `packages/ide/public/images`, but nothing in the UI consumes them.

The approved requirement is now:

- extract the mascot behavior into its own component, similar to `Meteors` and `Particles`
- image A enters from the left and exits on the right
- image B enters from the right and exits on the left
- there is no overlap between passes
- the idle time between passes must be random from `2000ms` to `5000ms`

## Goals

- Keep the background subtle rather than decorative foreground UI.
- Animate one mascot pass at a time with no overlap.
- Alternate direction every cycle.
- Pick the next cycle start after a randomized idle interval in a bounded range.
- Add a slow independent rotation on the mascot image without breaking the horizontal pass transform.
- Avoid immediately repeating the same image when alternatives exist.
- Keep the animation non-interactive and safe for all screens.

## Non-Goals

- Do not build a gallery or manual image picker.
- Do not show overlapping mascot passes.
- Do not move this logic into global app state.
- Do not redesign the existing `Meteors` or `Particles` components.

## Options Considered

### Option 1: Dedicated marquee component with alternating passes

Create a dedicated component such as `BackgroundMascotMarquee` that owns:

- the mascot image list
- the active image index
- the cycle direction
- the idle timer between passes
- the motion state for a single image crossing the viewport

Pros:

- clean separation from `SpaceBackground`
- matches the approved no-overlap marquee behavior directly
- easy to test cycle timing and direction alternation
- easy to keep subtle and predictable

Cons:

- slightly more state than a static background ornament

### Option 2: Keep the marquee logic inside `SpaceBackground`

Implement the same left/right pass behavior directly in `space-background.tsx`.

Pros:

- fewer files
- direct control where the background is composed

Cons:

- makes `SpaceBackground` own too much animation logic
- works against the user's explicit request to separate the component

### Option 3: Hook plus presentation component

Extract state into a custom hook and keep rendering in a small presentational component.

Pros:

- reusable if this motion model is needed elsewhere

Cons:

- unnecessary abstraction for a single known consumer
- more files than the current requirement needs

## Chosen Approach

Choose Option 1: dedicated marquee component with alternating passes.

This is the cleanest match for the approved design direction: subtle, extracted from `SpaceBackground`, one pass at a time, low maintenance, and easy to keep visually subordinate to the main content.

## Component Architecture

`SpaceBackground` should continue to own the full-screen fixed background shell, but it should stop owning mascot logic directly. Instead it should render a dedicated component such as:

- `BackgroundMascotMarquee`

The new component should be responsible for:

- holding the ordered list of image paths
- tracking the currently visible image index
- tracking the current travel direction
- tracking whether the component is waiting or moving
- tracking the next randomized idle delay
- cleaning up timers on unmount
- separating pass motion from inner-image rotation so transforms do not conflict

No global context is needed.

## Visual Behavior

The mascot layer should:

- use `pointer-events-none`
- sit behind content and remain non-blocking
- render large but low-opacity imagery
- travel near the lower or middle band of the screen so it reads as background motion
- move fully across the viewport
- rotate slowly over its own center while the pass is active
- never overlap with another mascot pass
- remain visually softer than the foreground UI

Recommended visual defaults:

- opacity roughly in the `0.08` to `0.16` range depending on theme
- pass duration long enough to feel ambient rather than comedic
- rotation duration slow enough to read as atmospheric rather than playful
- scale large enough to feel atmospheric, not like an inline illustration
- slightly different sizing and vertical placement on small screens so the mascot does not sit under important UI

## Timer Behavior

The scheduler should:

- choose a random delay from `2000ms` to `5000ms`
- schedule exactly one future pass at a time
- choose a different image when more than one image exists
- alternate direction every cycle
- start the next cycle only after the prior pass has completed and the idle delay has elapsed

This keeps the background alive without overlap and without creating a visible fixed rhythm.

## Motion and Accessibility

When `prefers-reduced-motion` is active:

- keep the one-at-a-time pass behavior
- reduce travel speed variation or use a simpler linear pass
- disable the extra slow rotation

This preserves the feature while respecting motion-sensitive users.

## Asset Strategy

The image list should be explicit and local to the mascot component or its module:

```ts
const BACKGROUND_MASCOTS = ["/images/cb.png", "/images/ein.png"];
```

This is sufficient for the current requirement and avoids introducing file-system discovery logic on the client.

## Error Handling

- If only one image exists, continue rendering it and skip no-repeat logic.
- If the image list is empty, render the existing background effects only.
- If an image fails to load, continue scheduling future passes without crashing the background.

## Testing

Add focused component tests for:

- randomized idle delay generation staying inside the `2000..5000` range
- next-image selection avoiding an immediate repeat when alternatives exist
- direction alternation between cycles
- timer cleanup on unmount
- transition from waiting to moving and back to waiting without overlap
- the pass wrapper keeping the travel class while the inner image receives a separate slow-rotation class

Visual tuning still requires manual browser review because opacity, scale, travel speed, and placement are inherently aesthetic choices.
