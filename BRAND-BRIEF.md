# Brand & Design Brief — Bennie Nkwantabisa Portfolio

## Positioning
Bennie is a researcher-turned-product-strategist who builds. The site's job is to
prove range without diluting focus: rigorous, thoughtful work (Work) and a full
creative life outside of it (Play) — choreography, photography, writing, graphic
design — presented with the same quiet confidence, not as a side note.

**Tagline:** "I'm Bennie, a product designer who engineers" / "a researcher who builds."
Short, plain, no adjectives doing the work for you.

## Core Feeling
Humanist, modern-natural, unmistakably calm. If the site were a physical object,
it would be a well-made paper good — Apple-adjacent in its restraint and
precision, but never robotic or heavy. "Almost like an Apple product" is the
brief; the operative word is *almost*. Warmth and breath matter more than
polish for its own sake. Think: a breath of fresh air, shiny-new, pretty
without trying.

## Visual Language

**Palette** — flat, paper-white ground, ink-black text, and two muted accents
used sparingly:
- `--paper #FFFFFF` / `--ink #1F1D1B` / `--ink-soft #5C564E` / `--ink-faint #9A9389`
- `--line #E7E3DC` (hairline dividers only)
- `--terracotta #C0764D` — warm accent, used for emphasis and the cursor
- `--sky-deep #5C84A3` — cool accent, used sparingly for balance

White is the primary background across the board; warm and cool tones are
accents, never dominant fields.

**Typography** — two typefaces, clear division of labor:
- Display: Playfair Display — light, serious, a little literary. Reserved for
  names, section titles, big statements.
- Body: Mulish — matches the display's energy without competing for attention.
  Never showy.

**Hierarchy** — a visitor should never wonder where to look. Large type carries
meaning; body copy stays quiet and functional. No decorative flourishes that
don't serve wayfinding.

**Texture** — the site is deliberately flat/matte rather than textured
literally, but the inspiration references (natural textures, soft light,
paper grain) inform the *mood*: clean, simplistic, a little tactile.

## Motion & Interaction

Motion is slow, breathy, and purposeful — never flashy. Guiding rule: if an
interaction doesn't reinforce the calm/considered feeling, cut it.

- **Reveals**: content fades/lifts in gently on scroll and on load — nothing
  snaps into place.
- **Custom cursor**: replaces the native pointer entirely (never trails it).
  Terracotta-accented circle; on hover over a project it lengthens into a
  pill and reads "Read more →". This is the site's signature interactive
  detail — cohesive, a little playful, never gimmicky.
- **Gloss/shine on project cards**: a smooth luster sweep on hover, upper-left
  to lower-right — like light passing over a high-quality printed page, not a
  blocky CSS shine effect.
- **Glitter on empty-space clicks**: a small burst of glitter falls and fades
  when you click somewhere with no interactive purpose — a tiny moment of
  delight that costs nothing and rewards curiosity.
- **Play category switching**: deliberate — a click, not a hover-trigger. The
  visitor should choose to move, not stumble into it.

## Imagery & Layout Principles

- **Work**: simple three-column project grid; the image (or video) carries the
  energy, the title sits small underneath. Nothing else competes with it.
- **Play galleries**: real column-masonry, not a rigid grid — rows shouldn't
  visually exist, spacing stays even, and the strongest pieces lead. Curated,
  not exhaustive: quality over completeness.
- **Footer**: minimal on purpose. Once someone has seen the work, there's
  nothing left to sell — credit and two links, nothing more.
- **No separate sub-pages** for Play categories — everything lives in one
  place (`play.html`), switched by category, so the experience stays
  contained and doesn't fragment into a maze of pages. The one sanctioned
  exit is a choreography video's YouTube link, which opens in a new tab
  rather than leaving the site.

## Voice
Plain, direct, unpretentious. Descriptions are cut, not padded — the work and
the craft speak for themselves. No marketing language, no forced cleverness.
