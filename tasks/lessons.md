# Lessons

## Case study pages: always include an Architecture section with a schematic diagram

**Pattern (2026-07-20, Account Industry Enrichment Pipeline):** a prose-only or
linear-flow-only architecture description is not enough — every new case study page
gets an `#architecture` section containing a proper schematic diagram (subsystem
boxes, nodes, labelled edges), not just the `.arch-flow` node row.

**How to build it on this site (no mermaid renderer, no new CSS allowed):**
- Hand-draw the schematic as an **inline SVG** (precedent: index.html blog-card SVG).
- Wrap it in the existing `.architecture-mockup` container class (project-detail.css).
- Style every element from existing CSS variables via SVG `style` attributes so it is
  theme-aware: containers `fill:var(--color-surface); stroke:var(--color-border)`,
  nodes `fill:rgba(0,168,255,0.1); stroke:var(--color-primary)` (matches
  `.arch-flow-node`), edges/labels `var(--color-text-muted)` / `var(--color-text-secondary)`.
- Give the SVG a `viewBox` + `style="width:100%;height:auto;display:block"` so it
  scales responsively, `role="img"` and a descriptive `aria-label`, and keep the full
  flow described in the surrounding prose (mobile/screen-reader fallback).
- Add the section to the sidebar nav and keep sidebar links ↔ section ids 1:1.

**Verification that caught real issues:** screenshot the rendered section in dark AND
light themes and at 375px — edge labels colliding with their lines only show up
visually; nudge coordinates and re-screenshot until clean.

**Sanitization is part of the pattern:** internal schematics carry employer/resource/
Key Vault/secret names, tenant URLs, publisher-prefixed field names, schedule times,
record counts, thresholds, and auth query strings. Strip ALL of it; keep only the
topology and architectural facts, then grep-sweep the page for the banned tokens
before calling it done.
