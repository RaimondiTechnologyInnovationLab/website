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
  assert.match(html, /Director/);
  assert.match(html, /Building.*?the team/s);
  assert.match(html, /not current members or advertised positions/);
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

test("social previews use the public Pages URL", () => {
  assert.match(html, /https:\/\/raimonditechnologyinnovationlab\.github\.io\/website\/og\.png/);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1/);
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
