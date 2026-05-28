# Nook — Home Page Design System

## Fonts

| Role | Family | Weight | Use |
|---|---|---|---|
| UI / Body | `'Geist', sans-serif` | 300–600 | Labels, buttons, stats, inputs |
| Display | `'Lora', serif` | 400–500, italic | Greeting, card titles, logo |

Numbers always get `font-variant-numeric: tabular-nums`.

---

## Theme Tokens (Calm — Default)

```
--app-bg:    #F7F3EE   ← outermost shell bg
--main-bg:   #F0EAE1   ← main content area
--card-bg:   #FDFCFA   ← all cards
--input-bg:  #EDE7DE

--text-1:    #1C1410   ← primary text
--text-2:    #6B5E54   ← secondary / labels
--text-3:    #A8998E   ← muted / captions

--border:    rgba(28,20,16,0.10)
--border-hov:rgba(28,20,16,0.18)

--accent:    #C2623F
--accent-bg: rgba(194,98,63,0.08)
--accent-bdr:rgba(194,98,63,0.20)

--card-sh:   0 20px 40px -15px rgba(28,20,16,0.07)
--hero-hov-sh:0 20px 40px -15px rgba(28,20,16,0.10)

--error-col: #B91C1C
--error-bg:  rgba(239,68,68,0.07)
--error-bdr: rgba(239,68,68,0.18)
```

Switch themes via `document.documentElement.setAttribute('data-theme', 'calm|regular|dark')`.

---

## Layout

```
Shell:       max-width 1440px · border-radius 24px · padding 10px · gap 10px
             shadow: 0 40px 120px rgba(0,0,0,0.16), 0 8px 32px rgba(0,0,0,0.08)

Sidebar:     width 200px · border-radius 16px · padding 16px 10px
  Logo mark: 26×26px · border-radius 8px · Lora 14px
  Nav item:  padding 8px 12px · border-radius 10px
             active → 2px left bar + --sb-active bg + --sb-accent color

Topbar:      padding 13px 22px · border-bottom 0.5px solid var(--topbar-bdr)

Hero Grid:   grid-template-columns 1fr 1fr 1fr · gap 12px · padding 14px 16px 16px
Hero Card:   border-radius 20px · box-shadow var(--card-sh)

Greeting:    bg var(--gb-bg) · border-radius 20px
```

---

## Column Color Tokens

Each hero column has its own semantic palette:

```
Finance     --fin-col:#2D6A4F  --fin-bg:rgba(45,106,79,0.07)  --fin-bdr:rgba(45,106,79,0.18)
Knowledge   --know-col:#1D6FA8 --know-bg:rgba(29,111,168,0.07) --know-bdr:rgba(29,111,168,0.18)
Lifestyle   --life-col:#A05C20 --life-bg:rgba(160,92,32,0.07)  --life-bdr:rgba(160,92,32,0.18)
```

Feature badge variants (theme-aware, use with `data-theme` selector):

```
calm:   --feat-know-fg:#2D6A4F  --feat-life-fg:#3D6BE8  --feat-fin-fg:#C2623F
dark:   --feat-know-fg:#4CAF80  --feat-life-fg:#E8A055  --feat-fin-fg:#6B8FEE
```

---

## Day Score Ring

Ring stroke color based on score:

| Score | Color |
|---|---|
| ≥ 80 | `#4ADE80` |
| 60–79 | `#F59E0B` |
| < 60 | `#EF4444` |

Inline style only (dynamic value). Everything else via CSS vars.

---

## Interaction Rules

```
Transition:   all 0.3s cubic-bezier(0.16, 1, 0.3, 1)   ← var(--ease-spring)
Button press: transform: scale(0.97)
Small control:transform: scale(0.95)
Focus ring:   outline: 2px solid var(--accent); outline-offset: 2px
Tap target:   min 44×44px
```

Every interactive element **must** have: hover + active + focus-visible states.

---

## Animations

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  from { background-position: -400px 0; }
  to   { background-position: 400px 0; }
}
```

Animate **transform + opacity only** — never top/left/width/height.

---

## Z-Index Scale

```
--z-base:   1
--z-sticky: 10
--z-modal:  100
--z-toast:  200
```

---

## Hard Rules

- No `font-family: Inter / DM Sans / Roboto / system-ui`
- No `#000000`
- No `height: 100vh` → use `min-height: 100dvh`
- No `z-index: 50` → use `var(--z-*)`
- No emoji in HTML → Phosphor icons (`ph-bold` weight class via CDN)
- No external CSS files → all styles in `globals.css`
- No hardcoded colors → CSS custom properties only
- No inline styles except dynamic values (chart widths, ring stroke-dashoffset)
