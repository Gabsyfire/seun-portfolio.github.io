# Task 2: One Renewal Engine, Two Clients case study

## Files to change
- [ ] `projects/one-renewal-engine-two-clients.html` — new page
- [ ] `index.html` — new Featured Projects card, placed FIRST (before the enrichment card)
- [ ] `sitemap.xml` — add the new URL
- [ ] `robots.txt` — no change needed; no JSON manifest exists

## Structure (unchanged findings from Task 1 — verified again this session)
- Stylesheets: `../css/style.css` + `../css/project-detail.css` + the byte-identical shared inline
  `<style>` block every project page carries (`.feature-*`, `.arch-flow-*`). The brief bans "inline
  <style> block" in the sense of NEW page-specific styling; the shared block IS the existing shell —
  omitting it would break the callout/feature classes. Carrying it over verbatim, zero new rules.
  (Same call approved on Task 1.)
- Card DOM: `article.project-card.slide-up[data-href]` → h3 → p → `.project-mockup > .mockup-browser`
  (titlebar dots+text; content: stat-row / doc-list / status-bar) → `.tech-tags` → `a.project-card-link`.
- Page shell: project-hero (back-link + theme toggle, h1, `p.project-tagline` as the eyebrow slot) →
  project-layout (sidebar `a.sidebar-link` 1:1 with `section[id]`) → project-footer → standard scripts.
  Nav/footer/meta are hand-rolled per page, not partials; copied verbatim.

## Section plan (sidebar label — content)
| id | label | content |
|---|---|---|
| executive-summary | Executive Summary | Lede |
| background | The Problem | problem prose (drift, quiet failure) |
| diagnosis | Diagnosis | diagnostic prose + "the bug was the fork" callout (feature-card style, as Task 1) |
| decision | The Decision | two-halves prose + load-order panel (mock-UI doc-list — Task 1 precedent for "code block") |
| architecture | Architecture | inline-SVG schematic per tasks/lessons.md house rule (see below) |
| shim | The Seam | "What made the shim hard" bullet list (`.project-content ul`) |
| technologies | Technologies | `.detail-tech-tags` |
| results | Results & Impact | 4 metric cards (1 / 2 / 0 / ~130) + Outcome + closing line |
| cta | Get in Touch | `.cta-box` |

## Judgment calls (all Task 1 precedent)
1. Eyebrow "Power Platform · Dynamics 365 · Mobile" → hero `p.project-tagline`.
2. Load-order "code block" → mock-UI panel (user chose this over raw `<pre>` on Task 1).
3. Callout → `feature-grid` with one full-width-ish `feature-card` (⚠ icon).
4. Stat tiles → `.metric-grid` in Results (~130 is the one permitted number).
5. Meta keywords + OG tags added per brief (siblings lack them; approved divergence on Task 1).
6. NEW vs Task 1: `tasks/lessons.md` now mandates a schematic architecture diagram on every case
   study (inline SVG, existing CSS vars, `.architecture-mockup` wrapper). Not in this brief —
   proposing to include one: web client + mobile host both loading the SAME engine artefact;
   mobile side shows launcher → bridge → shim → engine → offline store/sync. Confirm at check-in.

## Confidentiality sweep plan (stricter than Task 1)
Grep both changed files for: digits (every survivor must be architectural: 365, .NET-style platform
names, ~130, source counts), currency symbols, underscore tokens (no schema/field names), and
capitalised multi-word proper nouns (allowed: Microsoft, Dynamics 365, Power Platform, Resco Mobile
CRM, JavaScript, Dataverse, OData, FetchXML, Companies House refs elsewhere). Anything else → report,
don't guess.

## Verification
- [ ] Serve locally; homepage + new page; screenshots vs sibling page
- [ ] 375px and 1440px; dark + light themes (incl. SVG if approved)
- [ ] Back link / footer / sidebar scroll-spy from inside `projects/`
- [ ] Confidentiality grep sweep as above
- [ ] Validate HTML (python html.parser + tag-balance check as Task 1)
- [x] All verification steps completed — see review below

## Review (Task 2)
- Created `projects/one-renewal-engine-two-clients.html`: same shell as siblings (style.css +
  project-detail.css + shared inline block, hero with tagline-as-eyebrow, sidebar, footer, standard
  scripts). Sections: executive-summary / background / diagnosis (with "the bug was the fork"
  callout as feature-card) / decision (load-order mock-UI panel, Task 1 precedent) / architecture
  (inline-SVG schematic per lessons.md: web client + mobile launcher→bridge→shim stacks both
  consuming ONE engine node; single write path to Dataverse; offline sync edge) / shim (bullets) /
  technologies / results (1 · 2 · 0 · ~130 metric tiles + closing line) / cta.
- `index.html`: new card FIRST in Featured Projects (load-order mock panel, "One engine. Two
  clients. No fork." status bar, 5 tags). `sitemap.xml`: new URL added. robots.txt: no change;
  no manifest exists.
- Verified: sidebar links ↔ section ids 1:1 (9/9); back link → index#projects; card link →
  new page; zero console errors; full-page screenshots dark/light 1440px + 375px; schematic
  re-rendered after fixing an edge-label adjacency ("offline sync" rerouted to subgraph bottoms).
- Confidentiality sweep (both changed files): no currency symbols; no underscore tokens; visible
  digits are only 0/1/2 (tiles), 1–5 (load-order steps), ~130 (permitted line count), 365
  (platform name); capitalised sequences are only public vendor/platform names, the author, and
  headings. No client, employer, supplier, colleague or product-brand names; no schema/field
  names; no tenant/env/repo/ticket identifiers.
- HTML tag-balance validation passed on both files; sitemap parses as well-formed XML.

---

# Task 1: Account Industry Enrichment Pipeline case study

## Files to change
- [ ] `projects/account-industry-enrichment.html` — new case study page
- [ ] `index.html` — new Featured Projects card, placed FIRST (before the ISO 27001 card)
- [ ] `sitemap.xml` — add the new page URL
- [ ] `robots.txt` — no change needed (allows `/` already); no manifest exists

## Findings — how the site is built

### Stylesheets used by project pages
- `../css/style.css` + `../css/project-detail.css`.
- Each project page ALSO carries an identical inline `<style>` block defining `.feature-grid`,
  `.feature-card`, `.feature-card-icon`, `.arch-flow`, `.arch-flow-node`, `.arch-flow-arrow`.
  This block is byte-identical across vaultbridge / sales / iso pages — it is the house pattern,
  not a per-page invention. The new page will copy the SAME block verbatim. No new CSS, no new
  variables, no new classes are introduced.

### Featured Projects card (in `index.html`)
```
<article class="project-card slide-up" data-href="projects/<slug>.html">
  <h3>…</h3>
  <p>…</p>
  <div class="project-mockup">
    <div class="mockup-browser">
      <div class="mockup-titlebar"> 3× span.mockup-dot (red/yellow/green) + span.mockup-titlebar-text </div>
      <div class="mockup-content">
        <div class="mockup-stat-row"> 3× .mockup-stat( .mockup-stat-value[.accent] + .mockup-stat-label ) </div>
        <div class="mockup-doc-list"> .mockup-doc-row( span + span.mockup-badge.green/yellow/gray ) </div>
        <div class="mockup-status-bar"> span.mockup-status-dot.active + span </div>
      </div>
    </div>
  </div>
  <div class="tech-tags"> span.tag × N </div>
  <a href="projects/<slug>.html" class="project-card-link">View Case Study &rarr;</a>
</article>
```
All `mockup-*`, `tag`, `project-card*` classes live in `css/style.css` — reused as-is.

### Case study page shell (matches vaultbridge / sales / iso exactly)
1. `<head>`: charset, viewport, description, title, favicon, style.css, project-detail.css, shared inline `<style>` block.
2. `body` theme bootstrap script.
3. `section.project-hero` → `.project-hero-nav` (back-link `../index.html#projects` + theme-toggle button) → `h1` + `p.project-tagline`.
4. `.project-layout` → `aside.project-sidebar > nav > a.sidebar-link` + `.project-content > section[id]`.
5. `footer.project-footer` with the two standard lines.
6. Inline scripts (theme toggle, year, smooth-scroll, scroll-spy) + `../js/consent.js` + `../js/chatbot.js`.
   Nav/footer/meta are NOT partials — each page hand-rolls the same markup. I copy it verbatim.

### Section order for the new page (reusing existing classes only)
| Section id      | Sidebar label      | Content                                                              |
|-----------------|--------------------|---------------------------------------------------------------------|
| executive-summary | Executive Summary | Lede paragraph(s)                                                    |
| background      | The Problem        | "The problem" prose                                                  |
| approach        | Approach           | Intro + four-source PANEL (`mockup-browser`) + 4 numbered `<p>` blocks |
| matching        | Matching           | 2 callouts (`feature-grid` + 2 `feature-card`, ⚠ icon) + write-rules PANEL + closing point |
| gotchas         | Things That Bit    | `.project-content ul` bullet list                                   |
| technologies    | Technologies       | `.detail-tech-tags` tag list                                        |
| results         | Results & Impact   | 4 architecture-fact `.metric-card`s + Outcome prose                 |
| cta             | Get in Touch       | `.cta-box`                                                           |

## Judgment calls (no existing class → nearest equivalent, per the brief)
1. **Eyebrow "Data Engineering · Dynamics 365"** → rendered as the `p.project-tagline` in the hero
   (no eyebrow class exists; tagline is the nearest slot).
2. **Four-source waterfall panel** → `mockup-browser` doc-list (5 rows, badges). The brief explicitly
   says "same style as the mock-UI panels", so this is a direct reuse.
3. **Write-rules "code block"** → also a `mockup-browser` doc-list (condition → outcome badge). There is
   NO styled `pre`/`code` in the site; a bare `<pre>` would render unstyled and off-brand. Panel is the
   nearest existing idiom. (Alternative: a raw `<pre>` — flag for your call.)
4. **Two "callouts"** → `feature-grid` with 2 `feature-card`s (⚠ icon + h3 + p). No callout/aside class
   exists; feature-card is the nearest bordered-box equivalent.
5. **Stat tiles (4/3/2/1)** → `.metric-grid` in Results & Impact, matching where sibling pages put metrics.
6. **Meta keywords + OG tags**: sibling project pages have NEITHER (only index.html has OG). The brief
   explicitly requests both, so I add them, modelled on index.html's OG format. This is metadata only —
   no visual/CSS impact. Flagging because it differs from the siblings.

## Hard constraint — NO company data
No record counts, totals, percentages, batch sizes, thresholds, money, real names, URLs, secret names,
or emails. Employer = "a UK/IE Microsoft partner" / "a UK/IE MSP". Only architectural numbers allowed
(source counts, .NET 8, HTTP verbs, register counts). Final grep sweep for digits + names before done.

## Verification
- [ ] Serve locally; load homepage + new page.
- [ ] Visual parity with sibling pages (fonts/spacing/colours/cards/panels); screenshot.
- [ ] Responsive at 375px and 1440px.
- [ ] Back link, theme toggle, footer links work from inside `projects/`.
- [ ] grep both changed files for digits + client/employer/product names.
- [ ] Validate HTML.
- [ ] Append review section here.

## Review

### What changed
- **`projects/account-industry-enrichment.html`** (new): case study built on the exact sibling shell
  (`project-hero` + `project-layout` sidebar/content + `project-footer` + the standard inline scripts).
  Stylesheets: `style.css` + `project-detail.css` + the byte-identical shared inline `<style>` block. No
  new CSS, variables, classes, or visual language. Eight sections: Executive Summary, The Problem,
  Approach (four-source `mockup-browser` panel + 4 numbered source write-ups), Matching (2 `feature-card`
  callouts + write-rules `mockup-browser` panel + ambiguous-list closing point), Things That Bit
  (`.project-content ul`), Technologies (10 `.tag`s), Results & Impact (4 architecture-fact `.metric-card`s
  + outcome prose), Get in Touch (`.cta-box`).
- **`index.html`**: one new `.project-card` added as the FIRST card in the Featured Projects grid, before
  the ISO 27001 card. Reuses the `.mockup-browser` panel (stat-row 4 / 2-accent / 3, doc-list with
  Nightly/Weekly/Monthly green badges, status-bar footer) + 5 `.tag`s + `View Case Study →` link.
- **`sitemap.xml`**: new `<url>` for the page (priority 0.8, lastmod 2026-07-20), placed first among the
  project URLs to mirror the homepage ordering.
- **`robots.txt`**: no change (already `Allow: /`). No JSON manifest exists in the repo.

### Decisions taken (with the brief's "nearest equivalent" rule)
1. Eyebrow "Data Engineering · Dynamics 365" → hero `p.project-tagline` (no eyebrow class exists).
2. Four-source waterfall + write-rules "code block" → both rendered as `mockup-browser` doc-list panels.
   Confirmed with the user (the site has no styled `pre`/`code`; panel is the house idiom and reuses
   existing classes exactly). Inline `<code>` is used only for literal tokens (`contains()`, `$top`,
   `Prefer: odata.maxpagesize`, `@odata.nextLink`) — native inline element, no new CSS.
3. Two callouts → `feature-grid` + 2 `feature-card`s with a ⚠ icon.
4. Stat tiles 4/3/2/1 → `.metric-grid` in Results & Impact.
5. Meta keywords + OG tags added per the brief (siblings have neither; metadata only, no visual impact).

### Verification performed
- Served locally (python http.server); homepage + new page both return 200.
- Rendered the new page at 1440px (dark + light) and 375px — visually indistinguishable from the sibling
  pages (fonts, spacing, colours, cards, panels, tags, CTA all identical). Homepage card rendered and
  matches the other cards.
- Responsive: at 375px the sidebar collapses to a wrapped nav row, cards/tiles stack, panels stay readable.
- Chromium parsed both pages with ZERO page/console errors (the only homepage console errors are external
  Unsplash images + chatbot backend blocked by the sandbox proxy — pre-existing, unrelated).
- Functional: back-link navigates to `index.html#projects`; footer links resolve; 8 sidebar links map
  1:1 to the 8 section ids (scroll-spy verified); theme toggle present.
- No-company-data sweep: grepped both changed files for every digit and for client/employer/product names
  and emails. Every remaining digit is architectural (source ordinals, `.NET 8`, `NACE Rev 1.1/2`,
  candidate-count logic, the 4/3/2/1 tiles) or CSS/meta. No record counts, totals, percentages, batch
  sizes, thresholds, money, real names, URLs, secret names, or emails. Employer referred to only as
  "a UK/IE Microsoft partner" / "a UK/IE MSP".
- `sitemap.xml` validated as well-formed XML; new URL present; new card confirmed first in the grid.

### Follow-up: Architecture section (from internal schematic)
- Added an `#architecture` section (between Approach and Matching) distilled from the internal
  func README/mermaid schematic, using the existing `.arch-flow` node pattern the sibling pages
  use (classes were already in the shared inline style block — no new CSS).
- Flow: HubSpot / CH / CRO → Azure Functions (.NET 8) → Match + Write Rules → Dataverse PATCH
  (update-only) → Run Summary Email. Prose covers Logic App HTTP trigger + timer trigger, Key Vault
  via managed identity, blob-storage watermark, always-email summary, industry+group patched together.
- SANITIZED: the source doc contained employer/resource/Key Vault/secret names, an app registration
  ID, tenant URL, publisher-prefixed field names, record counts, batch caps, similarity thresholds,
  schedule times, real company names, and a dataset URL — none of it was carried over. Post-edit
  grep sweep for all of those tokens: clean. Sidebar updated; scroll-spy re-verified (9 links ↔ 9
  sections); section re-rendered and visually consistent.
- Follow-up 2: replaced the linear `.arch-flow` row with the full schematic as a hand-built inline
  SVG (subgraphs for HubSpot / Companies House / Azure / Dynamics 365; nodes for Logic App, Function
  App, Key Vault, blob watermark, summary email, Accounts; labelled edges incl. HTTP POST / JSON
  summary round-trip and PATCH · update-only). Styled entirely from existing CSS variables
  (`--color-surface/border/primary/text-*`) via SVG style attributes — matches `.arch-flow-node`
  colours exactly, theme-aware in dark AND light (verified by screenshot). Wrapped in the existing
  `.architecture-mockup` container class from project-detail.css. Inline SVG precedent: index.html
  blog-card SVG. Same sanitization applied to the mermaid source (resource/secret/tenant names,
  publisher-prefixed fields, schedule times, `?code=` auth all stripped); sweep clean. Rendered at
  1440px dark/light + 375px; scroll-spy and links re-verified.
