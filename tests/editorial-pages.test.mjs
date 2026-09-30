import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const output = new URL("../out/", import.meta.url);
const base = new URL("https://raimonditechnologyinnovationlab.github.io/website/");
const routes = [
  { file: "index.html", path: "", heading: null },
  { file: "news/index.html", path: "news/", heading: "News" },
  { file: "blog/index.html", path: "blog/", heading: "Blog" },
];
const roswellPath = "news/roswell-park-genomics-epigenomics-symposium-2026/";
const roswellPhotoPath = "news-images/roswell-park-symposium-2026.webp";
const roswellPhotoSource = `/website/${roswellPhotoPath}`;

function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#39|#(\d+)|#x([\da-f]+));/gi, (entity, decimal, hex) => {
    if (decimal) return String.fromCodePoint(Number(decimal));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">" }[entity.toLowerCase()];
  });
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, name, doubleQuoted, singleQuoted]) => [name.toLowerCase(), decode(doubleQuoted ?? singleQuoted)]));
}

function markup(html) {
  // Embedded RSC payloads and JS strings are not additional document elements.
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function textContent(html) {
  return decode(markup(html).replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ").trim();
}

function values(html, key) {
  return [...markup(html).matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag))
    .filter((tag) => tag.name === key || tag.property === key).map((tag) => tag.content);
}

function assertRoswellPhoto(html, label) {
  const circles = [...markup(html).matchAll(/<([a-z][\w:-]*)\b[^>]*\bclass="[^"]*\beditorial-image-circle\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi)];
  assert.equal(circles.length, 1, `Expected one circular photo: ${label}`);
  const photos = [...circles[0][2].matchAll(/<img\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  assert.equal(photos.length, 1, `Expected one image inside the circle: ${label}`);
  const [photo] = photos;
  assert.equal(photo.src, roswellPhotoSource, label);
  assert.equal(photo.width, "1536", label);
  assert.equal(photo.height, "2048", label);
  assert.ok(photo.alt?.trim(), `The symposium photo needs alternative text: ${label}`);
  assert.doesNotMatch(photo.style ?? "", /(?:transform\s*:[^;]*scale|(?:^|;)\s*scale\s*:)/i,
    `The photograph must not receive an inline zoom: ${label}`);
}

const documents = await Promise.all(routes.map(async (route) => ({
  ...route,
  url: new URL(route.path, base),
  html: await readFile(new URL(route.file, output), "utf8"),
})));

async function localTarget(value, source) {
  const url = new URL(value, source);
  if (url.origin !== base.origin) return null;
  assert.ok(url.pathname.startsWith(base.pathname), `Internal URL escapes /website/: ${url.href} (from ${source})`);
  const relative = decodeURIComponent(url.pathname.slice(base.pathname.length));
  let file = new URL(relative, output);
  // Do not allow URL-encoded path segments to escape the export directory.
  assert.ok(file.href.startsWith(output.href), `Internal URL escapes the export directory: ${url.href}`);
  const info = await stat(file).catch(() => null);
  assert.ok(info, `Missing local destination: ${url.href} (from ${source})`);
  if (info.isDirectory()) file = new URL("index.html", `${file.href.replace(/\/$/, "")}/`);
  await access(file);
  return { file, url };
}

test("home, News and Blog export complete, distinct documents with one main heading", () => {
  const titles = new Set();
  for (const page of documents) {
    const dom = markup(page.html);
    assert.match(dom, /<!doctype html>/i, page.file);
    assert.match(dom, /<html\b[^>]*\blang="en"/i, page.file);
    assert.match(dom, /<body\b[^>]*>[\s\S]+<\/body>/i, page.file);
    const headings = [...dom.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    assert.equal(headings.length, 1, `Expected exactly one H1: ${page.file}`);
    if (page.heading) assert.equal(textContent(headings[0][1]).replace(/\.$/, "").trim(), page.heading);
    const pageTitles = [...dom.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => textContent(match[1]));
    assert.equal(pageTitles.length, 1, `Expected one title: ${page.file}`);
    assert.match(pageTitles[0], /Technology Innovation Lab/);
    if (page.heading) assert.ok(pageTitles[0].includes(page.heading), page.file);
    assert.ok(!titles.has(pageTitles[0]), `Repeated page title: ${pageTitles[0]}`);
    titles.add(pageTitles[0]);
    assert.equal([...dom.matchAll(/<main\b/gi)].length, 1, page.file);
    assert.doesNotMatch(page.html, /localhost|127\.0\.0\.1|Your site is taking shape|Building your site/);
  }
});

test("archive metadata is specific to each page and uses the public canonical URL", () => {
  const descriptions = new Set();
  for (const page of documents.filter((page) => page.heading)) {
    const title = textContent(page.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const description = values(page.html, "description");
    assert.equal(description.length, 1, page.file);
    assert.ok(description[0].length > 30, `Archive needs a meaningful description: ${page.file}`);
    assert.ok(!descriptions.has(description[0]), `Archive descriptions must differ: ${page.file}`);
    descriptions.add(description[0]);
    const canonical = [...markup(page.html).matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag))
      .filter((tag) => tag.rel === "canonical").map((tag) => tag.href);
    assert.deepEqual(canonical, [page.url.href], page.file);
    assert.deepEqual(values(page.html, "og:title"), [title], page.file);
    assert.deepEqual(values(page.html, "og:description"), description, page.file);
    assert.deepEqual(values(page.html, "og:url"), [page.url.href], page.file);
    assert.deepEqual(values(page.html, "twitter:title"), [title], page.file);
  }
});

test("News and Blog are reachable from home content and every header and footer", () => {
  for (const page of documents) {
    const dom = markup(page.html);
    for (const landmark of ["header", "footer"]) {
      const content = dom.match(new RegExp(`<${landmark}\\b[^>]*>([\\s\\S]*?)<\\/${landmark}>`, "i"))?.[1];
      assert.ok(content, `Missing ${landmark}: ${page.file}`);
      const links = [...content.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attributes(tag));
      for (const kind of ["news", "blog"]) {
        assert.ok(links.some((link) => new URL(link.href, page.url).href === new URL(`${kind}/`, base).href),
          `Missing ${kind} link in ${landmark}: ${page.file}`);
      }
      if (page.heading && landmark === "header") {
        assert.ok(links.some((link) => link["aria-current"] === "page" && new URL(link.href, page.url).href === page.url.href),
          `Active archive must identify its current navigation link: ${page.file}`);
      }
    }
  }
  const homeMain = markup(documents[0].html).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  assert.ok(homeMain);
  for (const kind of ["news", "blog"]) {
    assert.ok([...homeMain.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => attributes(tag).href === `/website/${kind}/`),
      `Homepage content must introduce ${kind}, beyond navigation`);
  }
});

test("every page has a usable skip link to its focusable main landmark", () => {
  for (const page of documents) {
    const dom = markup(page.html);
    const skip = [...dom.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attributes(tag))
      .find((tag) => tag.class?.split(/\s+/).includes("skip-link"));
    const main = attributes(dom.match(/<main\b[^>]*>/i)?.[0] ?? "");
    assert.ok(skip, `Missing skip link: ${page.file}`);
    assert.equal(skip.href, `#${main.id}`, page.file);
    assert.ok(main.id, `Main landmark must have an ID: ${page.file}`);
    assert.equal(main.tabindex, "-1", `Skip target must accept keyboard focus: ${page.file}`);
  }
});

test("archives render article cards or honest empty states without leaking authoring templates", () => {
  for (const page of documents) {
    const dom = markup(page.html);
    assert.doesNotMatch(textContent(dom), /lorem ipsum|placeholder (?:post|article)|sample (?:post|article)|example (?:post|article)|TODO:|TBD\b/i,
      `Authoring placeholders must not be published: ${page.file}`);
    for (const kind of ["news", "blog"]) {
      const isEmpty = new RegExp(`class="[^"]*\\beditorial-empty-${kind}\\b`).test(dom);
      if (isEmpty) {
        assert.match(textContent(dom), kind === "news" ? /No news yet/ : /No posts yet/);
        for (const [tag] of dom.matchAll(/<a\b[^>]*>/gi)) {
          const href = attributes(tag).href;
          if (!href) continue;
          const target = new URL(href, page.url);
          if (target.origin !== base.origin) continue;
          assert.doesNotMatch(target.pathname, new RegExp(`^/website/${kind}/.+`), `Empty collection links to an invented article: ${target.href}`);
        }
      }
      if (page.path === `${kind}/`) {
        if (isEmpty) {
          assert.doesNotMatch(dom, /<time\b/i, `An empty archive must not invent publication dates: ${page.file}`);
          assert.doesNotMatch(dom, /<article\b[^>]*class="[^"]*\beditorial-card\b/);
        } else {
          assert.match(dom, /<article\b[^>]*class="[^"]*\beditorial-card\b/, `Archive needs content or an explicit empty state: ${page.file}`);
          assert.match(dom, /<time\b/i, `Published cards need publication dates: ${page.file}`);
        }
      }
    }
  }
});

test("the published Roswell Park article has its approved date, photo and official symposium link", async () => {
  const html = await readFile(new URL(`${roswellPath}index.html`, output), "utf8");
  const dom = markup(html);
  assert.match(dom, /<!doctype html>/i);
  const headings = [...dom.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert.equal(headings.length, 1);
  assert.match(textContent(headings[0][1]), /Roswell Park/);
  assert.match(textContent(dom.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""), /Roswell Park.*Technology Innovation Lab/);
  const publicationDates = [...dom.matchAll(/<time\b[^>]*>/gi)].map(([tag]) => attributes(tag).datetime);
  assert.deepEqual(publicationDates, ["2026-09-30"]);
  assert.match(textContent(dom), /30 September 2026/);
  assert.deepEqual(values(html, "article:published_time"), ["2026-09-30T00:00:00.000Z"]);
  const canonical = [...dom.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag))
    .filter((tag) => tag.rel === "canonical").map((tag) => tag.href);
  assert.deepEqual(canonical, [new URL(roswellPath, base).href]);
  const body = dom.match(/<div\b[^>]*\bclass="[^"]*\beditorial-body\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  assert.ok(body, "Expected the published article body");
  assert.ok([...body.matchAll(/<a\b[^>]*>/gi)].some(([tag]) => attributes(tag).href === "https://www.roswellparkomicssymposium.org/"),
    "Article must link to the official symposium website");
  assertRoswellPhoto(dom, "Roswell Park article");
});

test("home and News cards show the Roswell Park article and its circular photograph", () => {
  for (const page of documents.filter((page) => page.path === "" || page.path === "news/")) {
    const card = [...markup(page.html).matchAll(/<article\b[^>]*\bclass="[^"]*\beditorial-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi)]
      .map((match) => match[1]).find((html) => [...html.matchAll(/<a\b[^>]*>/gi)]
        .some(([tag]) => attributes(tag).href === `/website/${roswellPath}`));
    assert.ok(card, `The first published News article must be discoverable: ${page.file}`);
    assert.match(textContent(card), /Roswell Park/);
    assert.match(card, /<time\b[^>]*datetime="2026-09-30"/i);
    assertRoswellPhoto(card, page.file);
  }
});

test("each published blog illustration appears in its circular card and article", async () => {
  const archive = markup(documents.find((page) => page.path === "blog/").html);
  const cards = [...archive.matchAll(/<article\b[^>]*\bclass="[^"]*\beditorial-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi)];
  for (const [index, [, card]] of cards.entries()) {
    const img = attributes(card.match(/<img\b[^>]*>/i)?.[0] ?? "");
    assert.match(card, /\beditorial-image-circle\b/);
    assert.match(img.src ?? "", /^\/website\/blog-images\//);
    assert.ok(img.alt?.trim());
    assert.equal(img.width, img.height);
    const href = attributes(card.match(/<a\b[^>]*>/i)?.[0] ?? "").href;
    const article = markup(await readFile(new URL(`${href.replace(/^\/website\//, "")}index.html`, output), "utf8"));
    assert.ok(article.includes(`src="${img.src}"`), href);
    assert.match(article, /\beditorial-article-illustration\b/);
    const header = article.match(/<header\b[^>]*class="editorial-article-header"[^>]*>([\s\S]*?)<\/header>/i)?.[1];
    assert.ok(header?.includes(`src="${img.src}"`), "Blog artwork belongs beside the title, inside the article header");
    assert.equal([...article.matchAll(/class="editorial-image-circle"/g)].length, 1, "The article must not duplicate its illustration below the header");
    if (index < 3) assert.ok(markup(documents[0].html).includes(`src="${img.src}"`), "The latest blog image belongs on the homepage too");
    const asset = await readFile(new URL(img.src.replace(/^\/website\//, ""), output));
    assert.ok(asset.length < 150_000, "Keep blog thumbnail assets small");
    if (img.src.endsWith(".svg")) {
      const svg = asset.toString("utf8");
      assert.match(svg, /viewBox="0 0 \d+ \d+"/);
      assert.match(svg, /<desc\b/);
      assert.doesNotMatch(svg, /<(?:script|foreignObject|image|text|filter|animate|set)\b|\bon[a-z]+\s*=|\bhref\s*=|<!ENTITY|<!DOCTYPE/i,
        "Blog vectors must be self-contained, text-free static artwork");
      for (const [, element] of svg.matchAll(/<\/?([a-z][\w:-]*)/gi)) {
        assert.ok(["svg", "title", "desc", "defs", "clipPath", "pattern", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon"].includes(element), `Unexpected SVG element: ${element}`);
      }
    }
  }
});

test("circular editorial photos use centered cover cropping without a zoom transform", async () => {
  const cssFiles = (await readdir(output, { recursive: true })).filter((file) => file.endsWith(".css"));
  assert.ok(cssFiles.length, "Expected exported stylesheets");
  const css = (await Promise.all(cssFiles.map((file) => readFile(new URL(file, output), "utf8")))).join("\n");
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selectors, body]) => selectors.split(",")
    .map((selector) => ({ selector: selector.trim(), body, declarations: Object.fromEntries(body.split(";")
      .filter((declaration) => declaration.includes(":"))
      .map((declaration) => { const colon = declaration.indexOf(":"); return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()]; })) })));
  const declarationsFor = (selector) => Object.assign({}, ...rules.filter((rule) => rule.selector === selector).map((rule) => rule.declarations));
  const circle = declarationsFor(".editorial-image-circle");
  assert.equal(circle["border-radius"], "50%", "The image frame must be circular");
  assert.match(circle["aspect-ratio"] ?? "", /^1(?:\s*\/\s*1)?$/, "The circle must retain a square aspect ratio");
  const photo = declarationsFor(".editorial-image-circle img");
  assert.equal(photo["object-fit"], "cover");
  // The CSS minifier may reduce center center to center, 50%, or 50% 50%.
  assert.match(photo["object-position"] ?? "", /^(?:center(?:\s+center)?|50%(?:\s+50%)?)$/,
    "The crop must remain centered horizontally and vertically");
  for (const rule of rules.filter((rule) => rule.selector.includes(".editorial-image-circle"))) {
    assert.doesNotMatch(rule.declarations.transform ?? "", /(?:scale|matrix|perspective)\s*\(/i,
      `Do not zoom the photograph: ${rule.selector}`);
    if (rule.declarations.scale !== undefined) assert.match(rule.declarations.scale, /^(?:none|1(?:\s+1){0,2})$/,
      `Do not zoom the photograph: ${rule.selector}`);
  }
});

test("the exported symposium photo retains full dimensions and valid still WebP encoding", async () => {
  const photo = await readFile(new URL(roswellPhotoPath, output));
  assert.deepEqual(photo, await readFile(new URL(`../public/${roswellPhotoPath}`, import.meta.url)),
    "The build must copy the approved photograph without re-encoding it");
  assert.ok(photo.length >= 25, "Expected a complete WebP image");
  assert.equal(photo.toString("ascii", 0, 4), "RIFF");
  assert.equal(photo.toString("ascii", 8, 12), "WEBP");
  assert.equal(photo.readUInt32LE(4) + 8, photo.length, "The image must contain a complete RIFF payload");
  const chunks = [];
  for (let offset = 12; offset < photo.length;) {
    assert.ok(offset + 8 <= photo.length, "Truncated WebP chunk header");
    const kind = photo.toString("ascii", offset, offset + 4);
    const size = photo.readUInt32LE(offset + 4);
    assert.ok(offset + 8 + size <= photo.length, `Truncated ${kind} chunk`);
    chunks.push({ kind, payload: photo.subarray(offset + 8, offset + 8 + size) });
    offset += 8 + size + (size % 2);
  }
  assert.ok(!chunks.some(({ kind }) => ["ANIM", "ANMF"].includes(kind)), "Use a still WebP photograph");
  const images = chunks.filter(({ kind }) => ["VP8 ", "VP8L"].includes(kind));
  assert.equal(images.length, 1, "Expected one WebP image payload");
  const { kind, payload } = images[0];
  if (kind === "VP8L") {
    assert.ok(payload.length >= 5);
    assert.equal(payload[0], 0x2f, "Expected a valid lossless WebP signature");
    const dimensions = payload.readUInt32LE(1);
    assert.equal((dimensions & 0x3fff) + 1, 1536);
    assert.equal(((dimensions >>> 14) & 0x3fff) + 1, 2048);
  } else {
    assert.ok(payload.length >= 10);
    assert.deepEqual(payload.subarray(3, 6), Buffer.from([0x9d, 0x01, 0x2a]), "Expected a valid VP8 key frame");
    assert.equal(payload.readUInt16LE(6) & 0x3fff, 1536);
    assert.equal(payload.readUInt16LE(8) & 0x3fff, 2048);
  }
});

test("authoring template text and synthetic draft markers are absent from shipped HTML, JS and RSC", async () => {
  const files = (await readdir(output, { recursive: true })).filter((file) => /\.(?:html|js|mjs|json|txt|rsc|map)$/.test(file));
  assert.ok(files.some((file) => file.endsWith(".js")), "Expected shipped JavaScript to be inspected");
  const forbidden = [
    "replace-with-a-stable-slug",
    "Replace with the approved title",
    "Replace with a short, approved summary.",
    "Replace with the approved opening paragraph.",
    "Replace with approved supporting details.",
    "UNPUBLISHED_NEWS_",
    "UNPUBLISHED_BLOG_",
    "synthetic-news-draft",
    "synthetic-blog-draft",
  ];
  for (const file of files) {
    const body = await readFile(new URL(file, output), "utf8");
    for (const marker of forbidden) assert.ok(!body.includes(marker), `Unpublished authoring text in ${file}: ${marker}`);
  }
});

test("all exported HTML internal assets, links and fragment targets resolve under /website/", async () => {
  const files = await readdir(output, { recursive: true });
  const htmlFiles = files.filter((name) => name.endsWith(".html"));
  assert.ok(htmlFiles.includes("news/index.html"));
  assert.ok(htmlFiles.includes("blog/index.html"));
  const targetDocuments = new Map();
  for (const file of htmlFiles) {
    const source = new URL(file.replace(/index\.html$/, ""), base);
    const dom = markup(await readFile(new URL(file, output), "utf8"));
    const raw = await readFile(new URL(file, output), "utf8");
    // Script source tags matter even though their inline payloads are not markup.
    const tags = [...dom.matchAll(/<(?:a|area|img|link|source|video|audio|iframe|object|use)\b[^>]*>/gi),
      ...raw.matchAll(/<script\b[^>]*>/gi)];
    for (const [tag] of tags) {
      const attrs = attributes(tag);
      const references = [attrs.href, attrs.src, attrs.poster, attrs.data].filter(Boolean);
      // The current site has no data-URL srcsets. Keep data URLs out of comma splitting.
      if (attrs.srcset && !attrs.srcset.startsWith("data:")) {
        references.push(...attrs.srcset.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]));
      }
      for (const reference of references) {
        const destination = await localTarget(reference, source);
        if (!destination?.url.hash || !destination.file.pathname.endsWith(".html")) continue;
        let target = targetDocuments.get(destination.file.href);
        if (!target) {
          target = markup(await readFile(destination.file, "utf8"));
          targetDocuments.set(destination.file.href, target);
        }
        const ids = new Set([...target.matchAll(/\bid="([^"]+)"/g)].map((match) => decode(match[1])));
        const fragment = decodeURIComponent(destination.url.hash.slice(1));
        assert.ok(ids.has(fragment), `Missing fragment #${fragment} in ${destination.file.pathname} (from ${file})`);
      }
    }
  }
});
