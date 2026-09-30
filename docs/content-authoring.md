# News and Blog authoring

News holds announcements, publications, and milestones. Blog holds longer notes
about science, technology, and methods. The website shows honest empty states
for any collection without approved published material.

## Add an entry

1. Edit `app/editorial/content.ts`.
2. Add a complete entry to `newsEntries` or `blogEntries` using the template below.
   Replace every example value with approved content.
3. Keep `status: "draft"` while preparing the entry. Only `"published"` entries
   appear on the homepage, archive, or generated detail pages.
4. After content approval, change the status to `"published"` and check the site.

This template lives in documentation, outside the website's entry arrays. It is
not a real announcement and does not generate a page:

```ts
{
  slug: "replace-with-a-stable-slug",
  title: "Replace with the approved title",
  date: "2000-01-01", // Replace with the intended publication date.
  summary: "Replace with a short, approved summary.",
  status: "draft",
  // author: "Approved author name", // Optional; no author is assumed.
  body: [
    { type: "paragraph", text: "Replace with the approved opening paragraph." },
    { type: "heading", text: "An optional section heading" },
    { type: "paragraph", text: "Replace with approved supporting details." },
  ],
}
```

Draft filtering is a publishing guard, **not confidentiality**. Anything committed
to the public repository remains public in the source and Git history, even if
it never appears on the website. Keep private drafts outside this repository.
Do not commit confidential, embargoed, or unapproved material.

## Supported fields and blocks

- `slug`: unique within its collection; lowercase letters and numbers separated
  by single hyphens. Keep published slugs stable so existing links keep working.
- `title`, `summary`: required, nonempty plain text. These also populate page
  metadata; use a concise summary appropriate for search and shared links.
- `date`: a real calendar date in `YYYY-MM-DD` format. Dates display in UTC and
  entries sort newest first. Identical dates sort by slug for stable output.
- `status`: `"draft"` or `"published"`. There is no date-based scheduling: marking
  a future-dated entry published includes it in the next build immediately.
- `author`: optional approved name. Omit it rather than guessing authorship.
- `image`: optional approved local photo, with `src`, descriptive `alt`, and
  original pixel `width` and `height`. Place the raster asset in
  `public/news-images/`; use a lowercase hyphenated filename and PNG, JPG, JPEG,
  or WebP format. Paths in content begin with `/news-images/`, without
  `/website`. Images are displayed through a circular CSS mask on cards and
  article pages. Preserve the scene and keep the speaker small; do not zoom or
  retouch. Use lossless web encoding when optimizing an original photo.
- `body`: one or more structured blocks:
  - `{ type: "paragraph", text: "..." }`
  - `{ type: "heading", text: "..." }` for a second-level section heading
  - `{ type: "list", items: ["...", "..."], ordered: false }`
  - `{ type: "quote", text: "...", attribution: "..." }` (attribution optional)
  - `{ type: "link", text: "Read the source", href: "https://example.org/article" }`

Body text is escaped by React, not interpreted as Markdown or HTML. Links must
use HTTPS or begin with a single `/` for a path on this website, such as
`/news/approved-slug/` or `/#artifacts`. Do not add `/website` to internal content
links; the renderer applies the deployment prefix. Protocol-relative links,
credentials in links, script URLs, whitespace, and backslashes are rejected.
There is no arbitrary HTML, embedded script, remote embed, or inline image block.
Use the entry's optional `image` field for the approved lead photo.

## Pages and preview behavior

- `/news/` and `/blog/` list all published entries in their collection.
- `/news/[slug]/` and `/blog/[slug]/` are statically generated only for published
  entries. Unknown and draft slugs return not found.
- The homepage previews the three latest published entries per collection.
- Public links include `/website` in the GitHub Pages build. Local links are
  root-relative. Canonical metadata always points to the official GitHub Pages
  URL, even when you are previewing locally.
- Content modules and components are server-only. The homepage receives rendered
  previews rather than the authoring arrays or full article bodies. Do not import
  these modules into a `"use client"` file or pass entry objects to client code.

Validation rejects duplicate or malformed slugs, impossible dates, missing text,
invalid status values, empty bodies/lists, unsupported blocks, and unsafe links.
It checks drafts too, so fix authoring errors before building.

## Check before publication

```sh
npm run lint
npm run build:pages
npm run test:pages
git diff --check
```

Check the homepage preview, archive, and direct article URL at mobile and desktop
widths. Confirm the title, date, body, source links, and link-preview metadata.
Ensure draft text is absent from exported HTML and client assets. Do not invent
filler content to make the layout look populated.

A local build does not publish. Follow `AGENTS.md` and `README.md` for the
repository's authorization and GitHub Pages publication workflow. Do not push
or publish content until requested.
