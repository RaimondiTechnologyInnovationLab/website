# Website working agreement

## Canonical source and publication

- Work in this checkout. The official repository is
  `https://github.com/RaimondiTechnologyInnovationLab/website.git`, remote
  `github`, branch `main`.
- The official public site is
  `https://raimonditechnologyinnovationlab.github.io/website/`.
- GitHub Actions publishes `main`. The `.openai/hosting.json` manifest and
  Cloudflare/Sites configuration are retained only for compatibility/recovery.
  The previous `chatgpt.site` publication is a separate historical snapshot.
  Do not invoke Sites publication or change hosting providers unless the user
  requests it.

## Keep local, remote, and production aligned

1. Before editing, inspect the working tree and fetch `github`. With a clean
   working tree, fast-forward from `github/main` using `git pull --ff-only`.
   Preserve existing user changes. If histories differ, reconcile them without
   overwriting local work or force-pushing.
2. Make only the requested product changes. Do not silently revise other copy,
   roles, visual details, or branding. The approved role is Director and the
   brand subtitle is A lab in the making.
3. For publication, build with `npm run build:pages`, verify with
   `npm run test:pages`, and check `git diff --check`. Run the original
   `npm test` additionally when changes affect the Sites/dev build path.
4. Commit the intended source and push to `github/main`. Never force-push main.
   Fetch and reconcile remote updates if a normal push is rejected.
5. Wait for the Pages workflow to succeed for the exact pushed commit, then
   verify the requested content on the public site. Report an incomplete or
   failed deployment honestly rather than calling a successful push a release.
6. At handoff, fetch again, verify a clean working tree and matching local and
   remote commits (`git rev-list --left-right --count HEAD...github/main` is
   `0 0`), and confirm the successful deployment uses that commit. Explain any
   intentional remaining local work instead of claiming full synchronization.

Use `codex/` branches if work must be saved before it is ready for publication.
Undo a published change through a revert commit, not a history rewrite.
Never edit generated `out/` or `dist/` as the source. Keep secrets, dependency
folders, generated builds, and local backups out of commits.

The user wants localhost:3000 left running. Keep it available through builds
and publication unless asked to stop it. The Pages build uses isolated staging
and must not replace the local development server.
