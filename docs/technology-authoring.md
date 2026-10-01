# Technology-sharing pages

The `/technologies/` hub and each `/technologies/<slug>/` detail page are generated
from `app/technologies/content.ts`. There is no homepage section, backend, or
interest database. Email links open the visitor's email client; nothing is sent
automatically.

## Lab voice

Describe the lab's work with we, us, and our in introductions, method descriptions,
contact copy, and metadata. Keep publication titles and individual credits intact.
The prefilled email body is written by the visitor: its singular “I’m interested”
is intentional. Do not change the speaker or imply that an enquiry is from a team.

## Add a technology

Add one approved `Technology` record to the `technologies` array. Use a unique,
lowercase hyphenated slug, the public name, a concise summary, a category, a
local circular illustration, a source-backed overview and applications, and a
verified publication. Add a per-technology `access` object with the status,
contact copy, verified email address, and the appropriate availability note.
The hub, detail route, metadata, and email subject are generated from the record.
No new page or layout is needed.

Keep `status: "draft"` until publication is authorized. Draft entries do not
receive public routes or cards. This is a public repository: do not store private
or unapproved information in it, including in draft records.

## Resources

A resource with `status: "coming-soon"` renders a plain-text Coming soon badge,
not a link or a disabled imitation download. Do not create placeholder PDF files.
When an approved document is ready, add the actual file under `public/` and change
that resource to `status: "available"`, with its real `href` and a descriptive
`label`, for example `Download protocol (PDF)`. Local hrefs start with `/`; the
renderer adds the GitHub Pages base path automatically. Verify the exported file
and link before publishing.

Do not add kit quantities, contents beyond the approved enzyme description,
pricing, eligibility, shipping promises, or material-transfer terms without
explicit approval. Contact is an expression of interest, not an order or a
promise of supply. Confirm availability and material-transfer details individually.

## Validate and publish

Run `npm run build:pages`, `npm run test:pages`, focused ESLint, and
`git diff --check`. The exporter normalizes technology routes to slash-terminated
directory indexes, just like News and Blog. Check the hub, every published detail
page, the resource states, email subject/body, menu behavior, and phone layouts.
Follow the publication procedure in `AGENTS.md`; verify the exact commit's Pages
workflow and the live site before reporting completion.

D&D-seq overview source: final Cell paper, DOI 10.1016/j.cell.2026.05.014;
PubMed PMID 42242226, https://pubmed.ncbi.nlm.nih.gov/42242226/.
