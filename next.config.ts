import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(githubPages
    // Vinext's exporter requests the root route without basePath. This single
    // Routes and assets use the explicit Pages prefix via assetPath().
    // Vinext currently requests slashless URLs while prerendering. Enabling
    // trailingSlash makes those return 308 and silently drops non-root pages.
    // build-pages.mjs converts the exported HTML into Pages directory indexes.
    ? { output: "export", assetPrefix: "/website", trailingSlash: false }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: githubPages ? "/website" : "",
    NEXT_PUBLIC_SITE_ORIGIN: githubPages
      ? "https://raimonditechnologyinnovationlab.github.io"
      : "",
  },
};

export default nextConfig;
