# Task 4: Reposition the site as Power Platform + AI

Repositioning from "generic IT / systems analyst" to **Dynamics 365 CE Developer &
Power Platform + AI specialist who builds production AI agents**.

## Files changed
- [x] `index.html` — head/SEO, hero, About, Skills (5 groups), Projects (7 featured + More Work)
- [x] `css/style.css` — hero tagline/location/actions, `.btn-secondary`, `.project-flag`,
      compact card + More Work grid, `.cert-status`, mobile `html { overflow-x: clip }`
- [x] `js/main.js` — `skillData` rebuilt to match the 24 new skill badges 1:1
- [x] `projects/copilot-studio-agent-suite.html` — NEW (flagship)
- [x] `projects/ai-job-dispatcher.html` — NEW
- [x] `projects/field-engineer-checkin-app.html` — NEW
- [x] `projects/finance-proposal-gateway.html` — NEW
- [x] `projects/billing-api-data-sync.html` — rewritten (was "we" voice + inflated figures)
- [x] `cloudflare-worker/worker.js` — chatbot system prompt repositioned
- [x] `sitemap.xml` — 4 new URLs first among projects; homepage + billing lastmod bumped
- [x] Confidentiality sweep across the whole repo

## Featured order (AI first)
1. Copilot Studio Agent Suite (flagship) · 2. AI Job Dispatcher · 3. Field Engineer Check-In App
4. Enterprise Billing Integration · 5. Finance Proposal Gateway · 6. VaultBridge · 7. Sales KPI Dashboard

The seven earlier case studies were demoted to a **More Work** grid of compact cards rather
than deleted — the pages keep their URLs and their SEO, they just stop competing with the AI
work at the top of the page.

## SEO targets
`Power Platform Developer Belfast` · `Copilot Studio consultant` ·
`Dynamics 365 developer Northern Ireland`. Title, meta description, keywords, canonical,
Open Graph, plus a JSON-LD `Person` carrying jobTitle, `addressLocality: Belfast` and sameAs.

## Confidentiality rules applied
No employer or client names, no record counts tied to a company, no financial figures, no
vendor brands tied to the employer's stack. Scale described generically ("tens of thousands
of records"). Swept case-insensitively across the whole repo, including pre-existing pages
and this tasks folder, since the repo is public.

Removed in this pass: the offline-mobile-CRM vendor brand (still live despite the existing
lessons.md rule), the marketing-platform and e-signature vendor brands, "UK/IE MSP" and
"UK/IE Microsoft partner" as employer descriptors, a £2.4M pipeline figure, and a 1.2M
transaction volume.

## Verification
- [x] HTML tag-balance across all 19 pages
- [x] Sidebar links ↔ section ids 1:1 on every new/rewritten case study
- [x] 0 broken internal links site-wide; every sitemap URL resolves to a file
- [x] 24 skill badges ↔ 24 `skillData` entries, no orphans either way
- [x] Rendered dark + light at 1440px and 375px; architecture SVGs crop-checked for
      label collisions in both themes
- [x] 0px horizontal overflow at 375px (was 22px before this change)
- [x] No console errors except the chatbot worker, which is unreachable from a local server
- [x] JS syntax check on all four scripts; sitemap.xml well-formed

## Known pre-existing issue, not fixed here
`articles/sharepoint-governance.html` has a `#cta` section with no matching sidebar link,
so its sidebar is 9 links to 10 sections. Out of scope for this task.

## Not done
No CV PDF exists in the repo, so the hero ships three CTAs — View Projects / GitHub /
LinkedIn. Add `assets/Seun-Ogunwande-CV.pdf` and a fourth `.btn-secondary` when there is
a file to link.
