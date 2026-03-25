# NebulaSphere

A dreamy, mood-reactive cosmic nebula sphere built with React Three Fiber.
Responds to mouse (desktop) and touch (mobile/tablet). Colors breathe and
drift on their own, warping gently with pointer movement.

## Files

| File | Purpose |
|------|---------|
| `NebulaSphere.jsx` | The component — this is what you integrate |
| `App.jsx` | Demo wrapper + integration examples |
| `package.json` | Dependencies |

---

## Quick start options

### CodeSandbox
1. Create a new **React** sandbox at codesandbox.io
2. Replace `App.js` contents with `App.jsx`
3. Create `NebulaSphere.jsx` and paste the contents
4. Replace `package.json` with the one provided
5. The sandbox auto-installs — done

### Cursor / VS Code (Vite)
```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install three @react-three/fiber @react-three/drei uuid
# copy NebulaSphere.jsx into src/
# replace src/App.jsx
npm run dev
```

### Next.js (App Router)
1. Copy `NebulaSphere.jsx` into `components/NebulaSphere.jsx`
2. Add `'use client'` as the very first line
3. Install deps: `npm install three @react-three/fiber @react-three/drei uuid`
4. Import and use in any page

---

## Props

```jsx
<NebulaSphere
  mood="teal"           // "teal" | "blue" | "rose" | "amber" | "purple"
  showMoodPicker={true} // show the built-in color dots UI
  className=""          // extra CSS class on the container
  style={{}}            // extra inline styles on the container
/>
```

## Controlling mood from your own sidebar

```jsx
// In your parent component:
const [mood, setMood] = useState("teal");

// Your sidebar buttons call setMood("rose") etc.
<NebulaSphere mood={mood} showMoodPicker={false} />
```

## Mood palettes

| Key | Colors |
|-----|--------|
| `teal` | Deep teal → cyan → midnight navy |
| `blue` | Indigo → periwinkle → deep navy |
| `rose` | Deep rose → dusty coral → burgundy |
| `amber` | Deep amber → golden → ochre |
| `purple` | Deep violet → lavender → plum |

---

## How it works

- **Outer sphere** — custom GLSL with two-octave simplex noise sampling surface
  normals over time. Mouse/touch position offsets the noise coordinate, creating
  a gentle warp. Three mood colors blend via `smoothstep` — no hard lines.
- **Inner sphere** — Fresnel glass using a `CubeCamera` that re-renders the scene
  every frame into a cube texture. Chromatic aberration splits refraction into
  R/G/B rays. Breathing pulse scales the sphere on a ~6s sin() cycle.
- **Stars** — `@react-three/drei` `<Stars>` with low count and slow drift.
- **Color transitions** — on mood change, colors lerp each frame toward the new
  target palette, so it melts rather than snaps.
- **Pointer** — unified `pointermove` + `touchmove` on `window`, normalized to
  [-1, 1] space, smoothly lerped into the shader each frame.
