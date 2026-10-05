import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicBase = "https://raimonditechnologyinnovationlab.github.io/website";

const published = (kind, slug, date) => ({
  slug,
  title: `PUBLIC_${kind.toUpperCase()}_TITLE_${slug}`,
  date,
  summary: `PUBLIC_${kind.toUpperCase()}_SUMMARY_${slug}`,
  status: "published",
  author: "Synthetic test author",
  body: [
    { type: "paragraph", text: `PUBLIC_${kind.toUpperCase()}_BODY_${slug}` },
    { type: "heading", text: "A synthetic section" },
    { type: "list", items: ["First synthetic point", "Second synthetic point"], ordered: true },
    { type: "quote", text: "Synthetic quotation", attribution: "Synthetic attribution" },
    { type: "link", text: "Back to the news archive", href: "/news/" },
    { type: "paragraph", text: "<script>window.editorialUnsafeMarkup=1</script>" },
  ],
});

const draft = (kind) => ({
  slug: `private-${kind}-draft-sentinel`,
  title: `EDITORIAL_PRIVATE_DRAFT_${kind}_TITLE`,
  date: "2099-01-01",
  summary: `EDITORIAL_PRIVATE_DRAFT_${kind}_SUMMARY`,
  status: "draft",
  author: `EDITORIAL_PRIVATE_DRAFT_${kind}_AUTHOR`,
  body: [
    { type: "paragraph", text: `EDITORIAL_PRIVATE_DRAFT_${kind}_BODY` },
    { type: "heading", text: `EDITORIAL_PRIVATE_DRAFT_${kind}_HEADING` },
    { type: "list", items: [`EDITORIAL_PRIVATE_DRAFT_${kind}_LIST`] },
    { type: "quote", text: `EDITORIAL_PRIVATE_DRAFT_${kind}_QUOTE`, attribution: `EDITORIAL_PRIVATE_DRAFT_${kind}_ATTRIBUTION` },
    { type: "link", text: `EDITORIAL_PRIVATE_DRAFT_${kind}_LINK`, href: "https://example.org/synthetic-test-source" },
  ],
});

const news = [
  published("news", "oldest", "2025-01-01"),
  draft("news"),
  published("news", "latest-zeta", "2026-09-30"),
  published("news", "older", "2026-03-01"),
  published("news", "latest-alpha", "2026-09-30"),
  published("news", "recent", "2026-09-29"),
];
const blog = [
  published("blog", "older-blog", "2026-03-02"),
  draft("blog"),
  published("blog", "latest-zeta", "2026-09-30"),
  // A valid slug named index must not collide with the archive index.html.
  published("blog", "index", "2026-09-27"),
  published("blog", "latest-alpha", "2026-09-30"),
  published("blog", "approved-blog", "2026-09-28"),
];

function dom(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function cardSlugs(html, kind) {
  return [...html.matchAll(/<article\b[^>]*\bclass="[^"]*\beditorial-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi)]
    .flatMap(([, card]) => {
      const heading = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "";
      const slug = heading.match(new RegExp(`href="/website/${kind}/([^"/]+)/"`))?.[1];
      return slug ? [slug] : [];
    });
}

function replaceCollections(sourceText, collections) {
  const parsed = ts.createSourceFile("content.ts", sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const replacements = [];
  for (const statement of parsed.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !Object.hasOwn(collections, declaration.name.text)) continue;
      assert.ok(declaration.initializer, `Missing initializer: ${declaration.name.text}`);
      replacements.push({ start: declaration.initializer.getStart(parsed), end: declaration.initializer.end, value: collections[declaration.name.text] });
    }
  }
  assert.equal(replacements.length, Object.keys(collections).length, "Every fixture collection must replace one source declaration");
  for (const { start, end, value } of replacements.sort((a, b) => b.start - a.start)) {
    sourceText = `${sourceText.slice(0, start)}${JSON.stringify(value)}${sourceText.slice(end)}`;
  }
  return sourceText;
}

async function buildFixture(fixture) {
  return new Promise((resolve, reject) => {
    let log = "";
    const child = spawn(process.execPath, [join(fixture, "scripts/build-pages.mjs")], {
      cwd: fixture,
      env: { ...process.env, WRANGLER_WRITE_LOGS: "false" },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 150_000,
    });
    const collect = (chunk) => { log = `${log}${chunk.toString()}`.slice(-30_000); };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Synthetic editorial export failed (${signal ?? code}):\n${log}`));
    });
  });
}

test("an isolated export generates approved article pages without shipping synthetic drafts", { timeout: 180_000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), "til-editorial-fixture-"));
  const originalSource = await readFile(join(root, "app/editorial/content.ts"), "utf8");
  try {
    for (const entry of [
      "app", "public", "build", ".openai", "scripts", "package.json", "next.config.ts",
      "vite.config.ts", "tsconfig.json", "next-env.d.ts", "postcss.config.mjs",
    ]) await cp(join(root, entry), join(fixture, entry), { recursive: true });
    await symlink(join(root, "node_modules"), join(fixture, "node_modules"), "dir");

    const fixtureSource = replaceCollections(originalSource, { newsEntries: news, blogEntries: blog });
    await writeFile(join(fixture, "app/editorial/content.ts"), fixtureSource);
    await buildFixture(fixture);

    const output = join(fixture, "out");
    const home = dom(await readFile(join(output, "index.html"), "utf8"));
    const archiveNews = dom(await readFile(join(output, "news/index.html"), "utf8"));
    const archiveBlog = dom(await readFile(join(output, "blog/index.html"), "utf8"));
    for (const [kind, archive, expectedOrder] of [
      ["news", archiveNews, ["latest-alpha", "latest-zeta", "recent", "older", "oldest"]],
      ["blog", archiveBlog, ["latest-alpha", "latest-zeta", "approved-blog", "index", "older-blog"]],
    ]) {
      assert.deepEqual(cardSlugs(home, kind), expectedOrder.slice(0, 3),
        `The ${kind} homepage preview must contain exactly the latest three published entries in order`);
      assert.deepEqual(cardSlugs(archive, kind), expectedOrder,
        `The ${kind} archive must retain every published entry in order, including entries outside the homepage preview`);
    }

    for (const [kind, entries] of [["news", news], ["blog", blog]]) {
      for (const entry of entries.filter((entry) => entry.status === "published")) {
        const html = await readFile(join(output, kind, entry.slug, "index.html"), "utf8");
        const page = dom(html);
        assert.match(page, /<!doctype html>/i);
        assert.equal([...page.matchAll(/<h1\b/gi)].length, 1, `${kind}/${entry.slug}`);
        assert.ok(page.includes(`<title>${entry.title} | Technology Innovation Lab</title>`));
        assert.ok(page.includes(entry.summary));
        assert.ok(page.includes(entry.body[0].text));
        assert.ok(page.includes(`href="${publicBase}/${kind}/${entry.slug}/"`), "Article canonical is missing");
        assert.match(page, new RegExp(`<time\\b[^>]*datetime="${entry.date}"`, "i"), "Article date is missing");
        assert.ok(page.includes("&lt;script&gt;window.editorialUnsafeMarkup=1&lt;/script&gt;"), "Article text must be escaped");
        assert.doesNotMatch(html, /<script>window\.editorialUnsafeMarkup=1<\/script>/);
        assert.match(page, /href="\/website\/news\/"/);
        assert.match(page, new RegExp(`href="/website/${kind}/"`));
      }
      const draftEntry = entries.find((entry) => entry.status === "draft");
      await assert.rejects(access(join(output, kind, draftEntry.slug, "index.html")), { code: "ENOENT" });
    }

    const files = await readdir(output, { recursive: true });
    assert.ok(files.some((file) => file.endsWith(".js")), "No browser JavaScript was found to inspect");
    assert.ok(files.some((file) => file.endsWith(".rsc")), "No RSC output was found to inspect");
    for (const file of files) {
      assert.doesNotMatch(file, /private-(?:news|blog)-draft-sentinel/, `Draft route was exported: ${file}`);
      if (!/\.(?:html|js|mjs|json|txt|rsc|map)$/.test(file)) continue;
      const exported = await readFile(join(output, file), "utf8");
      assert.doesNotMatch(exported, /EDITORIAL_PRIVATE_DRAFT_|private-(?:news|blog)-draft-sentinel/, `Draft leaked into browser-served file: ${file}`);
    }
    // The fixture is never written into the real authoring source or real out/.
    assert.equal(await readFile(join(root, "app/editorial/content.ts"), "utf8"), originalSource);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
