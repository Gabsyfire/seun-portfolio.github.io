# Lessons

## Case study pages: always include an Architecture section with a schematic diagram

**Pattern (2026-07-20, Account Industry Enrichment Pipeline):** a prose-only or
linear-flow-only architecture description is not enough: every new case study page
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
light themes and at 375px, because edge labels colliding with their lines only show up
visually; nudge coordinates and re-screenshot until clean.

**Sanitization is part of the pattern:** internal schematics carry employer/resource/
Key Vault/secret names, tenant URLs, publisher-prefixed field names, schedule times,
record counts, thresholds, and auth query strings. Strip ALL of it; keep only the
topology and architectural facts, then grep-sweep the page for the banned tokens
before calling it done.

## Case studies: no vendor brands, no internal terminology, ever

**Pattern (2026-08-02, DialSync):** a case study shipped naming the phone-system vendor in the
title/slug/images and using an internal team abbreviation as a field name; the user corrected it
for HR/confidentiality reasons after it went live.

**Rules:**
- Name internal-work case studies with an invented product codename (VaultBridge precedent),
  never a vendor or product brand tied to the employer's stack.
- Replace internal team names, field names and report-section names with industry-standard
  wording (e.g. "sales team", "call status", "customer success"), in page text, card, slug,
  image pixels, alt text, aria-labels, HTML comments, sitemap AND tasks/*.md (the repo is public).
- Treat operational volume figures (calls/day, record counts) as company data: keep metrics
  architectural, and make fake numbers in mock images diverge from real magnitudes.
- Sweep case-insensitively for the banned tokens across the WHOLE repo before done, including
  pre-existing pages, generated images' source HTML, and this tasks folder.

## Big-number slots need short values; check the root element for mobile overflow

**Pattern (2026-08-19, Power Platform + AI repositioning):** two things only showed up in a
rendered screenshot, not in the markup.

- `.mockup-stat-value` and `.metric-card .value` are styled as large display numbers. A
  descriptive phrase in one of them ("Tens of thousands") wraps to two lines and reads as a
  layout bug. Keep those slots to a short token (a number, or one word like "Any" or
  "Live") and put the qualitative phrasing in the surrounding prose, where the
  confidentiality rules want it anyway.
- The homepage carried a 22px horizontal overflow at 375px. `body` already had
  `overflow-x: hidden`, which clips the closed off-canvas nav drawer visually but leaves the
  **root element** reporting the wider scroll width. The fix is `html { overflow-x: clip }`
  inside the mobile media query. Use `clip` rather than `hidden` because `hidden` would make the
  root a scroll container and break sticky positioning (the case-study sidebar depends on it).

**Verification that caught both:** measuring
`document.documentElement.scrollWidth - clientWidth` per page and per breakpoint, and
screenshotting metric grids at 375px rather than trusting the desktop view. Measure the
pre-change baseline too: the overflow here turned out to be pre-existing, which is worth
knowing before attributing it to your own diff.

## An em dash does four different jobs, so removing them is not find-and-replace

**Pattern (2026-08-19, em dash removal):** asked to replace em dashes with commas, a blanket
substitution across the site produced three classes of broken prose:

- **Run-on lists.** `in daily business use &mdash; helpdesk, sales, procurement` became
  `in daily business use, helpdesk, sales, procurement`, where the elaboration now reads as
  four more items in one flat list. A dash introducing an enumeration wants a **colon**.
- **Ambiguous labels.** `Dataverse &mdash; write` became `Dataverse, write`, which in a
  diagram node reads as two nodes. Short label pairs want **parentheses**.
- **Comma splices.** `not accuracy on a test set &mdash; it is that these are open on
  people's screens` joins two independent clauses; a comma there is ungrammatical, a
  **semicolon** is not.
- A **paired** parenthetical whose interior already contains commas
  (`the artefacts produced &mdash; asset inventory, risk register, ... &mdash; are exactly`)
  also needs parentheses, since two more commas make the sentence unparseable.

**How to do it:** run the blanket comma pass, then re-scan the *original* text for dashes
whose following clause contains two or more commas, or one comma plus "and"/"or". That
regex finds nearly every case needing something other than a comma. Read each hit before
choosing.

**Don't forget the generator of live text.** The chatbot worker's system prompt is prose
that becomes site content at runtime; it needed an explicit "no em dashes" instruction, or
the assistant would keep producing what the pages no longer contain.
