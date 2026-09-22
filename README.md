# Technology Innovation Lab

Ivan Raimondi’s research and vision for a future lab.

Public website: https://raimonditechnologyinnovationlab.github.io/website/

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

## Original Sites build

The original hosting path remains available and unchanged by the Pages build:

```sh
npm test
npm run build
npm run start
```

These commands produce the original Cloudflare/Sites build in `dist/`, with
root-relative asset paths. `.openai/hosting.json`, `worker/`, and `build/` retain
that configuration. The unused D1 and sign-in examples are not needed by this
website or by GitHub Pages. Do not commit `.env` files or generated output.
