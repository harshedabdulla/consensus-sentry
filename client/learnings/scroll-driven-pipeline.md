# Scroll-driven pipeline: the pinned thesis + stepping diagram

How the "Principles exist. Infrastructure does not." section
(`app/components/problem.tsx`) works, and why it's built this way.

---

## What the reader sees

On desktop, the left column (the thesis heading and its three paragraphs)
**stays pinned in place** while you scroll. As you keep scrolling, the right-hand
"Technical Architecture" card **fills in one node at a time** — User Query, then
Sentry Shield, then Audit Proof — each arriving with its own animation, and
finishing in a "Verified" completed state.

This is a **scrollytelling** pattern: one element is held still (pinned) while a
companion element advances through discrete states tied to scroll position.

---

## The core mechanic: a tall track + a sticky child

The whole effect rests on two nested elements:

```
<div ref={trackRef} className="... lg:h-[340vh]">   ← the TRACK (tall, scrollable)
  <div className="lg:sticky lg:top-0 lg:h-screen">  ← the PANEL (pinned for one screen)
    ... left column + right card ...
  </div>
</div>
```

- The **track** is `340vh` tall on desktop — much taller than the viewport. That
  extra height is the "scroll budget" the animation spends.
- The **panel** inside it is `position: sticky; top: 0; height: 100vh`. Sticky
  means it scrolls normally until it hits `top: 0`, then it *sticks* to the top
  of the viewport and stays there until its parent (the track) scrolls past.

So while you scroll through the `340vh` track, the panel is frozen on screen for
`340vh - 100vh = 240vh` worth of scrolling. That frozen window is where the
diagram does its stepping. The left thesis is just sitting in that same pinned
panel, which is *why it "stands as it is while scrolling."*

> Key idea: nothing is `position: fixed`. Sticky + an oversized parent gives you
> a pin that automatically releases when the section ends — no manual scroll math
> to un-pin, no overlap with the next section.

---

## Turning scroll position into a step number

A scroll listener measures how far we are *through* the track and converts that
to a discrete step `0–3`:

```ts
const rect = track.getBoundingClientRect();
const total = rect.height - window.innerHeight; // total pinned scroll distance
const scrolled = Math.min(Math.max(-rect.top, 0), total);
const progress = scrolled / total;             // 0 → 1
const next = Math.min(3, Math.floor(progress / 0.25 + 0.0001)); // 0,1,2,3
```

- `rect.top` is the track's top edge relative to the viewport. While the panel is
  pinned, `rect.top` goes from `0` down to negative values, so `-rect.top` is how
  far we've scrolled into the track. We clamp it to `[0, total]`.
- `progress` is that distance normalized to `0…1`.
- We cut `progress` into **four equal segments** (`0.25` each). Each segment is
  one step. `Math.floor(... + 0.0001)` guards against floating-point landing just
  under a boundary.

Four segments → four states: step 0 (Query), 1 (Shield), 2 (Proof), 3 (Completed).

### Why `requestAnimationFrame`

Scroll events fire very frequently. We don't do the measurement directly in the
handler; we coalesce to at most one measurement per frame:

```ts
const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
```

`update()` clears `raf` when it runs, so multiple scroll events between frames
collapse into a single layout read. This keeps scrolling smooth and avoids
layout thrash.

---

## Making each step animate "once, on arrival"

The trick to one-shot CSS animations in React is **mount/unmount**. A CSS
animation plays when the element first appears; if the element stays mounted it
won't replay. So each node is rendered *conditionally* on its step:

```tsx
{show2 && (
  <g key="node-shield" className="anim-fade-in"> ... </g>
)}
```

- `show1 = inView`, `show2 = step >= 1`, `show3 = step >= 2`, `done = step >= 3`.
- When `step` crosses a threshold, the node mounts → its `anim-*` class plays
  once.
- Scroll back up and the node unmounts; scroll down again and it remounts and
  replays. That's the desired behavior — the animation re-fires each time you
  re-enter the step.

The `key` is stable per node so React treats it as the same element across
re-renders (only mounting/unmounting on the visibility condition, not on every
step change).

### The four animation "kinds"

Each step deliberately uses a *different* motion so the steps feel distinct.
These live in `app/globals.css`:

| Step | Element | Class | Motion |
|---|---|---|---|
| 0 | User Query node | `anim-slide-in` | slides in from the left |
| 1 | Connector 1 | `anim-draw` | line draws itself in |
| 1 | Sentry Shield node | `anim-fade-in` + pulsing scan ring | fades in, light pulses |
| 2 | Connector 2 | `anim-draw` | line draws itself in |
| 2 | Audit Proof node | `anim-stamp` | scales+rotates in like a rubber stamp |
| 3 | Verification seal | `anim-seal` | check badge settles in |

Two SVG-specific details worth remembering:

- **`anim-draw` uses `pathLength={1}`.** Normalizing the path length to `1` lets
  one keyframe (`stroke-dashoffset: 1 → 0`) draw *any* connector regardless of
  its real pixel length.
- **`anim-stamp` / `anim-seal` need `transform-box: fill-box`.** By default an
  SVG element transforms around the SVG's `(0,0)` origin, which makes `scale()`
  fling it across the canvas. `transform-box: fill-box; transform-origin: center`
  makes it scale around its own bounding box instead.

---

## Supporting cues

- **Faint skeleton.** A low-opacity outline of the *entire* pipeline is always
  rendered underneath. So the not-yet-revealed nodes are implied (no empty gaps,
  no layout pop as each one appears).
- **Progress rail.** The three segments under the card header (Query · Evaluate ·
  Attest) recolor as `step` advances, giving the reader a "you are here" cue.
- **Synced explanation.** The panel at the bottom is keyed on `step`
  (`<div key={step} ...>`), so it re-mounts and fades each time the step changes,
  swapping in that step's copy.

---

## Graceful degradation

The fancy version is desktop-only on purpose. Two guards handle everything else:

1. **Viewport / device.** Inside `update()`:
   ```ts
   const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
   if (!isDesktop || total <= 0) { setStep(3); return; }
   ```
   On narrow screens (where the `lg:h-[340vh]` track and `lg:sticky` don't apply)
   the diagram just jumps to its finished state. The explanatory panel also
   switches from the one-at-a-time desktop view (`hidden lg:block`) to a static
   list of all three steps (`lg:hidden`).

2. **Reduced motion.** Every `anim-*` rule is wrapped in
   `@media (prefers-reduced-motion: no-preference)`. Users who ask for less
   motion get the final composition with no animation — the content is identical,
   it just doesn't move.

- **IntersectionObserver** gates the very first node's entrance (`inView`) so the
  "slide in" isn't wasted while the section is still far below the fold.

---

## If you want to tune it

- **Pacing too fast/slow?** Change the track height (`lg:h-[340vh]`). Taller =
  more scroll per step.
- **More or fewer steps?** The `0.25` segment size and the `Math.min(3, …)` cap
  both assume four states. Change both together.
- **Different motion per step?** Add a keyframe + class in `globals.css` and
  swap the `className` on the relevant `<g>`.

---

## Files involved

- `app/components/problem.tsx` — the component (track, sticky panel, scroll→step
  logic, conditional node rendering).
- `app/globals.css` — the `cs-slide-in`, `cs-stamp`, `cs-seal`, `cs-draw`
  keyframes and their `anim-*` classes, all under `prefers-reduced-motion`.
