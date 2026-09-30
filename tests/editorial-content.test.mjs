import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/editorial/content.ts", import.meta.url), "utf8");
const assetSource = await readFile(new URL("../app/asset-path.ts", import.meta.url), "utf8");

function moduleURL(sourceText) {
  const { outputText, diagnostics } = ts.transpileModule(sourceText, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
  });
  assert.equal(diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error).length, 0);
  return `data:text/javascript;base64,${Buffer.from(`${outputText}\n//# sourceURL=editorial-test-fixture.mjs`).toString("base64")}`;
}

async function loadContent(sourceText = source) {
  // The server-only marker is a bundler guard, not a runtime dependency for pure
  // helper tests. Use the real asset helper; do not substitute production logic.
  assert.match(sourceText, /^import "server-only";/m);
  assert.match(sourceText, /from "\.\.\/asset-path"/);
  const standalone = sourceText.replace(/^import "server-only";\s*/m, "")
    .replace('from "../asset-path"', `from ${JSON.stringify(moduleURL(assetSource))}`);
  return import(moduleURL(standalone));
}

const content = await loadContent();
const entry = (overrides = {}) => ({
  slug: "approved-update",
  title: "Approved update",
  date: "2026-09-30",
  summary: "A public summary approved for publication.",
  status: "published",
  author: "Ivan Raimondi",
  body: [{ type: "paragraph", text: "Approved public body text." }],
  ...overrides,
});
const image = (overrides = {}) => ({
  src: "/news-images/approved-update.webp",
  alt: "A speaker presenting research at a symposium",
  width: 1536,
  height: 2048,
  ...overrides,
});

function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
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

test("News and Blog collections validate, expose only sorted published entries, and exclude authoring templates", () => {
  for (const kind of ["news", "blog"]) {
    const entries = content.getPublishedEntries(kind);
    assert.deepEqual(entries, content.selectPublishedEntries(entries));
    assert.ok(entries.every((entry) => entry.status === "published"));
    assert.ok(entries.every((entry) => entry.slug !== "replace-with-a-stable-slug"));
    assert.equal(content.getPublishedEntry(kind, "__invalid-test-slug__"), undefined);
  }
});

test("empty content collections support an honest empty state", async () => {
  const empty = await loadContent(replaceCollections(source, { newsEntries: [], blogEntries: [] }));
  for (const kind of ["news", "blog"]) assert.deepEqual(empty.getPublishedEntries(kind), []);
});

test("published selection excludes drafts, sorts newest first, and never changes its input", () => {
  const entries = freeze([
    entry({ slug: "old", date: "2025-12-31" }),
    entry({ slug: "private-draft", date: "2027-01-01", status: "draft" }),
    entry({ slug: "zeta", date: "2026-09-30" }),
    entry({ slug: "alpha", date: "2026-09-30" }),
  ]);
  const before = JSON.stringify(entries);
  const selected = content.selectPublishedEntries(entries);
  assert.deepEqual(selected.map(({ slug }) => slug), ["alpha", "zeta", "old"]);
  assert.notEqual(selected, entries);
  assert.equal(JSON.stringify(entries), before);
  assert.deepEqual(content.selectPublishedEntries([]), []);
  assert.deepEqual(content.selectPublishedEntries([entry({ status: "draft" })]), []);
});

test("collection lookups expose only published entries, including with synthetic drafts present", async () => {
  const newsDraft = entry({ slug: "synthetic-news-draft", status: "draft", title: "UNPUBLISHED_NEWS_TITLE_SENTINEL", summary: "UNPUBLISHED_NEWS_SUMMARY_SENTINEL", body: [{ type: "paragraph", text: "UNPUBLISHED_NEWS_BODY_SENTINEL" }] });
  const blogDraft = entry({ slug: "synthetic-blog-draft", status: "draft", title: "UNPUBLISHED_BLOG_TITLE_SENTINEL", summary: "UNPUBLISHED_BLOG_SUMMARY_SENTINEL", body: [{ type: "paragraph", text: "UNPUBLISHED_BLOG_BODY_SENTINEL" }] });
  const newsPublished = entry({ slug: "approved-news" });
  const blogPublished = entry({ slug: "approved-blog" });
  const fixtureSource = replaceCollections(source, {
    newsEntries: [newsDraft, newsPublished],
    blogEntries: [blogPublished, blogDraft],
  });
  const fixture = await loadContent(fixtureSource);
  for (const [kind, draft, published] of [["news", newsDraft, newsPublished], ["blog", blogDraft, blogPublished]]) {
    assert.deepEqual(fixture.getPublishedEntries(kind), [published]);
    assert.equal(fixture.getPublishedEntry(kind, draft.slug), undefined);
    assert.deepEqual(fixture.getPublishedEntry(kind, published.slug), published);
    assert.doesNotMatch(JSON.stringify(fixture.getPublishedEntries(kind)), /UNPUBLISHED_|synthetic-(?:news|blog)-draft/);
  }
});

test("valid date, optional author and all supported plain-text block types are accepted", () => {
  assert.doesNotThrow(() => content.validateEditorialEntries([entry({
    date: "2024-02-29",
    author: undefined,
    body: [
      { type: "paragraph", text: "Text with <tags> stays plain text." },
      { type: "heading", text: "A section" },
      { type: "list", items: ["One", "Two"], ordered: true },
      { type: "list", items: ["One"], ordered: false },
      { type: "quote", text: "Quoted text", attribution: "Source" },
      { type: "quote", text: "Unattributed text" },
      { type: "link", text: "Read the source", href: "https://example.org/paper" },
      { type: "link", text: "Back to news", href: "/news/" },
    ],
  })]));
});

test("editorial images are optional and accept supported local formats and dimension limits", () => {
  assert.doesNotThrow(() => content.validateEditorialEntries([entry()]));
  assert.doesNotThrow(() => content.validateEditorialEntries([entry({ image: undefined })]));
  for (const extension of ["png", "jpg", "jpeg", "webp"]) {
    for (const dimensions of [{ width: 1, height: 10000 }, { width: 10000, height: 1 }]) {
      const illustrated = freeze(entry({ image: image({ src: `/news-images/photo-2026.${extension}`, ...dimensions }) }));
      const before = JSON.stringify(illustrated);
      assert.doesNotThrow(() => content.validateEditorialEntries([illustrated]));
      assert.deepEqual(content.selectPublishedEntries([illustrated]), [illustrated]);
      assert.equal(JSON.stringify(illustrated), before, "Image validation must not mutate authoring content");
    }
  }
});

for (const src of [
  "", " ", undefined, null, 123,
  "https://example.org/photo.webp", "//example.org/photo.webp", "data:image/png;base64,AAAA",
  "news-images/photo.webp", "/website/news-images/photo.webp", "/images/photo.webp",
  "/news-images/../photo.webp", "/news-images/nested/photo.webp", "/news-images/%2e%2e/photo.webp",
  "/news-images/Photo.webp", "/news-images/photo.WEBP", "/news-images/photo_name.webp",
  "/news-images/photo name.webp", "/news-images/café.webp", "/news-images/.webp",
  "/news-images/photo.svg", "/news-images/photo.gif", "/news-images/photo.webp?size=400",
  "/news-images/photo.webp#fragment", "/news-images/photo.webp\n", "/news-images/photo\\name.webp",
]) {
  test(`invalid editorial image source is rejected: ${JSON.stringify(src)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ image: image({ src }) })]), /Editorial content:.*image/s);
  });
}

for (const value of [null, "photo.webp", [], {}]) {
  test(`invalid editorial image object is rejected: ${JSON.stringify(value)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ image: value })]), /Editorial content:.*image/s);
  });
}

for (const alt of [undefined, null, "", " \n\t ", 123]) {
  test(`invalid editorial image alternative text is rejected: ${JSON.stringify(alt)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ image: image({ alt }) })]), /Editorial content:.*image/s);
  });
}

for (const dimension of ["width", "height"]) {
  for (const value of [undefined, null, 0, -1, 1.5, 10001, Number.NaN, Number.POSITIVE_INFINITY, "1536", true]) {
    test(`invalid editorial image ${dimension} is rejected: ${String(value)}`, () => {
      assert.throws(() => content.validateEditorialEntries([entry({ image: image({ [dimension]: value }) })]), /Editorial content:.*image/s);
    });
  }
}

test("draft images receive the same validation before published entries are selected", () => {
  assert.throws(() => content.selectPublishedEntries([
    entry({ status: "draft", image: image({ src: "https://example.org/private-photo.webp" }) }),
  ]), /Editorial content:.*image/s);
});

for (const slug of ["", "Capitalized", "has spaces", "has_underscores", "-leading", "trailing-", "two--hyphens", "../escape", "a/b", "a?b", "a#b", "%2F", "café"]) {
  test(`invalid slug is rejected: ${JSON.stringify(slug)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ slug })]), /slug/);
  });
}

test("duplicate slugs fail even when one entry is a draft", () => {
  assert.throws(() => content.validateEditorialEntries([entry(), entry({ status: "draft" })]), /duplicate slug/);
  assert.throws(() => content.selectPublishedEntries([entry(), entry({ status: "draft" })]), /duplicate slug/);
});

for (const date of ["", "2026-02-30", "2025-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-01-32", "2026-9-30", "30-09-2026", "2026-09-30T12:00:00Z", "not-a-date"]) {
  test(`invalid publication date is rejected: ${JSON.stringify(date)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ date })]), /real date in YYYY-MM-DD/);
  });
}

test("invalid drafts fail validation instead of silently disappearing", () => {
  assert.throws(() => content.selectPublishedEntries([entry({ status: "draft", date: "2026-02-30" })]), /real date/);
});

test("publication is controlled by status, without implying date-based scheduling", () => {
  const future = entry({ slug: "future-approved-update", date: "2099-01-01" });
  assert.deepEqual(content.selectPublishedEntries([entry(), future]).map(({ slug }) => slug), [future.slug, "approved-update"]);
});

for (const [field, value] of [["title", " "], ["summary", ""], ["author", " "], ["status", "scheduled"], ["body", []], ["body", null]]) {
  test(`invalid ${field} is rejected: ${JSON.stringify(value)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ [field]: value })]), /Editorial content:/);
  });
}

for (const block of [null, { type: "html", text: "<script>alert(1)</script>" }, { type: "paragraph", text: "" }, { type: "heading", text: " " }, { type: "quote", text: "Quote", attribution: "" }, { type: "list", items: [] }, { type: "list", items: [""] }, { type: "list", items: ["Item"], ordered: "yes" }, { type: "link", text: "", href: "https://example.org" }, { type: "link", text: "Unsafe", href: "javascript:alert(1)" }]) {
  test(`invalid content block is rejected: ${JSON.stringify(block)}`, () => {
    assert.throws(() => content.validateEditorialEntries([entry({ body: [block] })]), /Editorial content:/);
  });
}

test("editorial source links allow HTTPS and internal paths but reject executable and ambiguous URLs", () => {
  for (const href of ["https://example.org", "https://example.org/paper?x=1&y=2#results", "/news/", "/#artifacts"]) {
    assert.equal(content.isSafeEditorialLink(href), true, href);
  }
  for (const href of ["", "javascript:alert(1)", "data:text/html,unsafe", "http://example.org", "//example.org", "news/", "https://user:password@example.org", "https://example.org/a b", "https://example.org/\n", "/\\example.org", "/\u0000", "/\u007f"]) {
    assert.equal(content.isSafeEditorialLink(href), false, JSON.stringify(href));
  }
});

test("date labels remain deterministic and use UTC", () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of ["Pacific/Honolulu", "Pacific/Kiritimati", "UTC"]) {
      process.env.TZ = timezone;
      assert.equal(content.formatEditorialDate("2026-09-30"), "30 September 2026");
      assert.equal(content.formatEditorialDate("2024-02-29"), "29 February 2024");
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test("archive and article paths respect local and GitHub Pages deployment prefixes", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    for (const prefix of ["", "/website"]) {
      process.env.NEXT_PUBLIC_BASE_PATH = prefix;
      assert.equal(content.editorialPath("news"), `${prefix}/news/`);
      assert.equal(content.editorialPath("blog"), `${prefix}/blog/`);
      assert.equal(content.editorialPath("news", "approved-update"), `${prefix}/news/approved-update/`);
      assert.equal(content.editorialPath("blog", "approved-update"), `${prefix}/blog/approved-update/`);
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("archive and article metadata share the official origin and distinguish content", () => {
  for (const kind of ["news", "blog"]) {
    const archive = content.getEditorialMetadata(kind);
    const article = content.getEditorialMetadata(kind, entry());
    const archiveURL = `https://raimonditechnologyinnovationlab.github.io/website/${kind}/`;
    assert.equal(archive.alternates.canonical, archiveURL);
    assert.equal(archive.openGraph.url, archiveURL);
    assert.equal(archive.openGraph.type, "website");
    assert.equal(article.alternates.canonical, `${archiveURL}approved-update/`);
    assert.equal(article.openGraph.url, article.alternates.canonical);
    assert.equal(article.openGraph.type, "article");
    assert.equal(article.openGraph.publishedTime, "2026-09-30T00:00:00.000Z");
    assert.deepEqual(article.openGraph.authors, ["Ivan Raimondi"]);
    assert.equal(article.description, entry().summary);
    assert.equal(article.title, "Approved update | Technology Innovation Lab");
    for (const metadata of [archive, article]) {
      assert.equal(metadata.openGraph.title, metadata.title);
      assert.equal(metadata.twitter.title, metadata.title);
      assert.equal(metadata.openGraph.description, metadata.description);
      assert.equal(metadata.twitter.description, metadata.description);
      assert.match(metadata.openGraph.images[0].url, /^https:\/\/raimonditechnologyinnovationlab\.github\.io\/website\//);
    }
  }
});
