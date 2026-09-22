import { spawn } from "node:child_process";
import { access, cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const staging = await mkdtemp(join(tmpdir(), "til-github-pages-"));
const output = join(root, "out");

try {
  // Vinext builds into dist/. An isolated copy preserves both the Sites output
  // and any running development server. Dependencies are shared, not installed.
  for (const entry of [
    "app", "public", "build", ".openai", "package.json", "next.config.ts",
    "vite.config.ts", "tsconfig.json", "next-env.d.ts", "postcss.config.mjs",
  ]) {
    await cp(join(root, entry), join(staging, entry), { recursive: true });
  }
  await symlink(join(root, "node_modules"), join(staging, "node_modules"), "dir");
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(root, "node_modules/vinext/dist/cli.js"), "build"], {
      cwd: staging,
      env: { ...process.env, GITHUB_PAGES: "true" },
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`GitHub Pages build failed (${signal ?? code}).`));
    });
  });
  // A successful compiler exit must also include the exported home page.
  await access(join(staging, "dist/client/index.html"));
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(join(staging, "dist/client"), output, { recursive: true });
  // Vinext includes assetPrefix in the filesystem output; GitHub applies the
  // repository prefix when serving the artifact, so remove that one directory.
  await cp(join(output, "website/_next"), join(output, "_next"), { recursive: true });
  await rm(join(output, "website"), { recursive: true, force: true });
  await writeFile(join(output, ".nojekyll"), "");
  console.log("Static site ready in out/ for https://raimonditechnologyinnovationlab.github.io/website/");
} finally {
  await rm(staging, { recursive: true, force: true });
}
