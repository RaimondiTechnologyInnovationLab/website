import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(githubPages
    // Vinext's exporter requests the root route without basePath. This single
    // page uses hash navigation; only its public assets need the Pages prefix.
    ? { output: "export", assetPrefix: "/website", trailingSlash: true }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: githubPages ? "/website" : "",
    NEXT_PUBLIC_SITE_ORIGIN: githubPages
      ? "https://raimonditechnologyinnovationlab.github.io"
      : "",
  },
};

export default nextConfig;
