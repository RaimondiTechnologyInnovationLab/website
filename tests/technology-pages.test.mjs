import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const output = new URL("../out/", import.meta.url);
const clean = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const home = clean(await readFile(new URL("index.html", output), "utf8"));
const hub = clean(await readFile(new URL("technologies/index.html", output), "utf8"));
const detail = clean(await readFile(new URL("technologies/dnd-seq/index.html", output), "utf8"));

test("technology routes export complete, unique metadata and one main heading", () => {
  for (const [path, html, title] of [["", hub, "Try our technologies"], ["dnd-seq/", detail, "D&amp;D-seq"]]) {
    assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
    assert.equal([...html.matchAll(/<main[ >]/g)].length, 1);
    assert.ok(html.includes(`<title>${title}`));
    assert.ok(html.includes(`href="https://raimonditechnologyinnovationlab.github.io/website/technologies/${path}"`));
    assert.match(html, /href="#main"/);
    assert.match(html, /<main id="main" tabindex="-1">/);
    assert.match(html, /href="\/website\/technologies\/" aria-current="page"/);
  }
});

test("technologies are reachable in every header and footer, outside the home scroll", async () => {
  for (const file of (await readdir(output, { recursive: true })).filter((name) => name.endsWith(".html") && name !== "404.html")) {
    const html = clean(await readFile(new URL(file, output), "utf8"));
    for (const tag of ["header", "footer"]) {
      const region = html.match(new RegExp(`<${tag}\\b[^>]*class="${tag === "footer" ? "site-footer" : "site-header"}[^"\\n]*"[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1];
      assert.ok(region?.includes('href="/website/technologies/"'), `Missing technology navigation: ${file} ${tag}`);
    }
  }
  const main = home.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main);
  assert.doesNotMatch(main, /technology-catalogue|technology-card|id="technologies"/);
  assert.match(main, /updates-grid/);
  assert.match(hub, /href="\/website\/technologies\/dnd-seq\/"/);
  assert.equal([...hub.matchAll(/<article class="technology-card"/g)].length, 1);
});

test("unavailable resources are honest non-interactive Coming soon labels", () => {
  const resources = detail.match(/<section id="resources"[\s\S]*?<\/section>/)?.[0];
  assert.ok(resources);
  assert.match(resources, /Application note \/ white paper/);
  assert.match(resources, /Detailed protocol/);
  assert.equal([...resources.matchAll(/<span class="technology-resource-status">Coming soon<\/span>/g)].length, 2);
  assert.doesNotMatch(resources, /<a\b|<button\b|download=|\.pdf/);
});

test("interest link is an encoded email outline with no form or submission backend", () => {
  const hrefs = [...detail.matchAll(/href="(mailto:[^"]+)"/g)].map(([, href]) => decode(href));
  const contact = new URL(hrefs.find((href) => href.includes("?subject=")));
  assert.equal(contact.pathname, "ivr4003@med.cornell.edu");
  assert.equal(contact.searchParams.get("subject"), "D&D-seq — starter kit interest");
  for (const field of ["D&D-seq", "Name:", "Institution / lab:", "Research question / project:", "Biological system:"]) {
    assert.ok(contact.searchParams.get("body").includes(field), `Missing email field: ${field}`);
  }
  assert.doesNotMatch(detail, /<form\b|<input\b|<textarea\b/);
  assert.match(detail, /Availability and material-transfer details are confirmed individually/);
  assert.match(detail, /not an order or a guarantee of supply/);
  assert.match(detail, /href="https:\/\/doi.org\/10.1016\/j.cell.2026.05.014"/);
  assert.match(detail, /Opens your email app/);
});

test("technology artwork is a compact native SVG and shared by hub and detail", async () => {
  const art = await readFile(new URL("technology-images/dnd-seq.svg", output), "utf8");
  assert.ok(Buffer.byteLength(art) < 20_000);
  assert.match(art, /<desc>/);
  assert.doesNotMatch(art, /<script|<foreignObject|<image/);
  for (const html of [hub, detail]) {
    assert.match(html, /class="technology-art editorial-image-circle"/);
    assert.match(html, /src="\/website\/technology-images\/dnd-seq.svg"/);
  }
});
