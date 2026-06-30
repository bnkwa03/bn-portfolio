# Design Direction — BN Portfolio

## Essence
**Humanist · nature-inspired · modern-natural.** Clean and minimalistic,
almost like an Apple product page — but *almost* is the operative word. It stays
warm, organic, and human rather than robotic or heavy. A breath of fresh air:
shiny, new, clean, pretty.

## Palette
Warm base, cool accent.

| Token         | Hex       | Role                                  |
|---------------|-----------|---------------------------------------|
| `--paper`     | `#FAF6F0` | Warm cream base                       |
| `--paper-deep`| `#F1E9DD` | Base gradient depth                   |
| `--sand`      | `#E7D8C4` | Grounding warm tone                   |
| `--terracotta`| `#C0764D` | Warm accent (eyebrow, small emphasis) |
| `--sky`       | `#AFC9DC` | Cool drifting light                   |
| `--sky-deep`  | `#7BA3C2` | Cool accent (italic emphasis)         |
| `--ink`       | `#2A2622` | Warm near-black text                  |
| `--ink-soft`  | `#6B635A` | Secondary text                        |

The warm field leads (grounded, human); cool sky light drifts through it for the
fresh, airy quality. This keeps it from feeling sterile.

## Type
- **Display / headers:** Playfair Display, weight 400 — light and serious.
- **Body:** Mulish, weights 300–500 — matches the energy without competing.
- Clear, single-focus hierarchy: eyebrow → title → subline → actions. The user
  always knows where to look.

## Texture & motion
- Subtle SVG film grain + soft-light blend = tactile "fresh / new" feel.
- Two slow-drifting radial glows (cool + warm) breathe across the background
  (26–32s loops).
- Entrances are slow and breathy: blur + fade + rise, staggered.
- All motion honors `prefers-reduced-motion`.

## Inspiration source
Mood and texture references live in `/inspiration` (a representative set pulled
from the Drive `bn-portfolio/visuals` folder). The light-mode images guide the
*essence* — not literal layout. Dark mode is deferred for now.
