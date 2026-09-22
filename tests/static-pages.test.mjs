import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const output = new URL("../out/", import.meta.url);
const base = "https://raimonditechnologyinnovationlab.github.io/website/";
const html = await readFile(new URL("index.html", output), "utf8");

async function assertLocalAsset(value, source = base) {
  const url = new URL(value, source);
  if (url.origin !== new URL(base).origin) return;
  assert.ok(url.pathname.startsWith("/website/"), `Asset escapes repository path: ${url.href}`);
  const relative = decodeURIComponent(url.pathname.slice("/website/".length));
  await access(new URL(relative, output));
}

test("Pages contains complete HTML, the approved identity, and no invented colleagues", () => {
  assert.match(html, /<title>Ivan Raimondi \| Technology Innovation Lab<\/title>/);
  assert.match(html, /A lab in the making/);
  assert.match(html, /Principal Investigator/);
  assert.match(html, /Building.*?the team/s);
  assert.match(html, /Future team/);
  assert.match(html, /class="hero-cells"/);
  assert.match(html, /mailto:ivr4003@med.cornell.edu/);
  assert.doesNotMatch(html, /Lena Hart|Milo Chen|Nora Velez|Theo Mercer/);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
});

test("all HTML assets exist below the GitHub Pages repository path", async () => {
  const assets = new Set();
  for (const tag of html.matchAll(/<(?:img|script|link)\b[^>]*>/g)) {
    for (const attribute of tag[0].matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      assets.add(attribute[1].replaceAll("&amp;", "&"));
    }
  }
  assert.ok(assets.size > 5, "Expected JavaScript, CSS, images, and favicon");
  for (const asset of assets) await assertLocalAsset(asset);
});

test("social previews use the current image at the public Pages URL", async () => {
  const metadata = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) =>
      [name, value.replaceAll("&amp;", "&")],
    )),
  );
  const values = (name) => metadata
    .filter((tag) => tag.property === name || tag.name === name)
    .map((tag) => tag.content);
  const imageName = "og-til-cells-2026-09.png";
  const imageURL = new URL(imageName, base).href;
  assert.deepEqual(values("og:image"), [imageURL]);
  assert.deepEqual(values("twitter:image"), [imageURL]);
  assert.doesNotMatch(JSON.stringify(metadata), /\/og\.png|New York skyline/);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1/);

  const image = await readFile(new URL(imageName, output));
  assert.ok(image.length >= 33, "Preview must contain a complete PNG header");
  assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(image.toString("ascii", 12, 16), "IHDR");
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  assert.equal(width, 1200);
  assert.equal(height, 630);
  assert.deepEqual(values("og:image:width"), [String(width)]);
  assert.deepEqual(values("og:image:height"), [String(height)]);
  assert.ok(image.length < 1024 * 1024, "Preview should be under 1 MiB for fast sharing");
  assert.deepEqual(await readFile(new URL("og.png", output)), image,
    "The previous image URL must also serve the current preview");
});

test("CSS assets resolve and all navigation anchors have destinations", async () => {
  const files = await readdir(output, { recursive: true });
  for (const file of files.filter((name) => name.endsWith(".css"))) {
    const css = await readFile(new URL(file, output), "utf8");
    for (const match of css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)) {
      if (match[1].startsWith("data:")) continue;
      await assertLocalAsset(match[1], new URL(file, base).href);
    }
  }
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `Missing anchor: ${match[1]}`);
  }
  await access(fileURLToPath(new URL(".nojekyll", output)));
});
