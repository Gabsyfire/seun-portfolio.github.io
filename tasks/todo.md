# Task 5: Remove em dashes site-wide

Every em dash removed from the rendered site. The default replacement is the comma,
with three narrow exceptions where a comma would be wrong rather than merely different.

## The rule applied

| Where the dash was doing this | Replacement | Example |
|---|---|---|
| Joining clauses or trailing an aside (the common case) | comma | `people actually use, five Copilot Studio agents in production, daily` |
| Introducing a list | colon | `in daily business use: helpdesk, sales, procurement, reporting and security` |
| Name, then descriptor (titles, window title bars) | colon | `VaultBridge: Multi-Tenant Credential Vault` |
| Wrapping a parenthetical that already contains commas | parentheses | `The sales floor's needs (speed, clarity, headline numbers) drove the design` |
| Joining two independent clauses | semicolon | `not accuracy on a test set; it is that these are open on people's screens` |
| Short diagram or UI chip labels | parentheses | `Dataverse (write)`, `Azure Function (.NET 8)` |

A blanket find-and-replace to a comma was not viable: it produced run-on lists
(`in daily business use, helpdesk, sales, procurement...`), ambiguous diagram nodes
(`Dataverse, write`), and comma splices.

## Files changed
- [x] `index.html`, all 14 `projects/*.html`, `articles/sharepoint-governance.html`, `privacy-policy.html`
- [x] `js/main.js`: skill-modal bullet text
- [x] `cloudflare-worker/worker.js`: chatbot system prompt told not to emit em dashes,
      so live chat answers match the site

## Also fixed
Two sentences in `projects/automated-document-management.html` started with a lowercase
"the", left over from the vendor-brand sweep in Task 4 replacing a brand name that had
been the first word of the sentence.

## Left alone deliberately
En dashes in numeric ranges (`Days 0&ndash;30`) are correct typography and are not em dashes.

## Verification
- [x] 0 em dashes remain in any `.html` or `.js` file
- [x] HTML tag-balance across all 19 pages; sidebar links to section ids still 1:1
- [x] No doubled commas, orphan commas, or commas stranded before a closing tag
- [x] Rendered dark and light at 1440px and 375px; diagram labels still fit their boxes
      after the switch to parentheses
- [x] `main.js` and `worker.js` syntax checks; `sitemap.xml` well-formed
- [x] Confidentiality sweep from Task 4 still clean
