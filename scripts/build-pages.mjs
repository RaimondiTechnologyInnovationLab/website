import { spawn } from "node:child_process";
import { access, cp, mkdir, mkdtemp, readdir, rename, rm, symlink, writeFile } from "node:fs/promises";
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
  // A compiler exit alone is insufficient: Vinext may skip an unrenderable
  // route. Check every required archive before replacing the previous output.
  for (const page of ["index.html", "news.html", "blog.html"]) {
    await access(join(staging, "dist/client", page));
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(join(staging, "dist/client"), output, { recursive: true });
  // Vinext includes assetPrefix in the filesystem output; GitHub applies the
  // repository prefix when serving the artifact, so remove that one directory.
  await cp(join(output, "website/_next"), join(output, "_next"), { recursive: true });
  await rm(join(output, "website"), { recursive: true, force: true });
  // Export with trailingSlash:false to avoid Vinext's prerender 308 bug, then
  // serve clean, slash-terminated URLs on GitHub Pages. Preserve .rsc files in
  // their exporter locations. Only editorial routes need normalization.
  const files = await readdir(output, { recursive: true });
  // Move deepest routes first so an article with slug "index" cannot be
  // overwritten by its collection's new index.html.
  const editorialHTML = files.filter((file) => /^(?:news|blog)(?:\/.*)?\.html$/.test(file))
    .sort((a, b) => b.length - a.length);
  for (const file of editorialHTML) {
    const destination = join(output, file.slice(0, -".html".length), "index.html");
    await mkdir(dirname(destination), { recursive: true });
    await rename(join(output, file), destination);
  }
  await writeFile(join(output, ".nojekyll"), "");
  console.log("Static site ready in out/ for https://raimonditechnologyinnovationlab.github.io/website/");
} finally {
  await rm(staging, { recursive: true, force: true });
}
