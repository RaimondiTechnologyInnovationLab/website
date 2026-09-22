# Technology Innovation Lab

Ivan Raimondi’s research and vision for a future lab.

Public website: https://raimonditechnologyinnovationlab.github.io/website/

Repository: https://github.com/RaimondiTechnologyInnovationLab/website

## One source of truth

The `main` branch on GitHub is the official saved source. This local checkout
is its working copy; GitHub Pages is built from a specific commit of that same
branch. Git is version control, not live folder synchronization: local edits
reach GitHub after a commit and push, and reach the website after a successful
Pages deployment.

Use this sequence for every update:

1. Check `git status --short --branch`, then `git fetch --prune github`.
   With a clean working tree, run `git pull --ff-only github main` before editing.
   Preserve any existing local changes; resolve divergence before proceeding.
2. Edit the tracked source in this checkout and preview locally. Avoid parallel
   edits in the GitHub web editor; if another machine or editor changes GitHub,
   fetch and integrate those changes before pushing.
3. Run `npm run build:pages`, `npm run test:pages`, and `git diff --check`.
   Commit the intended files and push `main` to `github`. Never force-push `main`.
4. Check the Pages workflow for that exact commit. Finish only after its build
   and deployment succeed; a successful push alone does not update the website.
5. Fetch again and confirm the working tree is clean and
   `git rev-list --left-right --count HEAD...github/main` prints `0 0`.

For every additional clone, set `git config --local pull.ff only` and
`git config --local push.default simple`. These make pulls refuse diverged
history and keep pushes on the matching tracked branch. Uncommitted work is
not backed up on GitHub. Use a `codex/` branch for work that should be saved
remotely before it is ready to publish; only `main` publishes the website.

Generated `out/`, `dist/`, and local backup folders are not sources to edit or
synchronize. To undo a published change, make a revert commit and publish it
through the same workflow rather than replacing files manually.

## Local development

Use Node.js 22.13 or newer:

```sh
npm ci
npm run dev -- --port 3000
```

Edit the page and interactions in `app/`, and public images in `public/`.
The site uses React and Vinext. It does not require a database, sign-in, or an
email service; contact links open the visitor’s email application.

## GitHub Pages

```sh
npm run build:pages
npm run test:pages
```

The build exports complete HTML plus interactive JavaScript to `out/`. It uses
`/website` as the public base path and the GitHub Pages domain for social
previews. Its temporary build directory is removed after completion; the local
server and existing `dist/` build are preserved.

In repository **Settings → Pages**, select **GitHub Actions** as the source.
The Pages workflow builds, checks, and publishes on each push to `main`; it can
also be run manually from Actions. GitHub supplies the deployment token, so no
custom credential or paid hosting service is needed in the workflow.

## Link preview image

Open Graph and Twitter use `public/og-til-cells-2026-09.png` (1200 × 630).
The matching SVG is the editable source; export it at those dimensions after
visual changes. Keep the preview consistent with the hero when changing the
site's branding. Use a new image filename in `app/layout.tsx` for a new design,
and copy the same PNG to `public/og.png` for clients using the previous URL.
`npm run test:pages` checks the exported image, metadata, and legacy copy.
Messaging apps may retain previews already cached for a shared page URL.

## Archived Sites configuration

The previous `chatgpt.site` publication is a separate historical snapshot; it
does not follow GitHub updates. GitHub Pages is the official public website.
Do not publish to Sites or use it as an alternative source unless explicitly
requested. Its configuration is retained for recovery and compatibility:

```sh
npm test
npm run build
npm run start
```

These commands produce the original Cloudflare/Sites build in `dist/`, with
root-relative asset paths. `.openai/hosting.json`, `worker/`, and `build/` retain
that configuration. The unused D1 and sign-in examples are not needed by this
website or by GitHub Pages. Do not commit `.env` files or generated output.
