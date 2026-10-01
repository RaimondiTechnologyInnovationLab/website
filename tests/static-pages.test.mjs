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
  assert.match(html, /<title>Technology Innovation Lab<\/title>/);
  assert.match(html, /class="brand-affiliation">@SCB</);
  assert.match(html, /Principal Investigator/);
  assert.match(html, /Building.*?the team/s);
  assert.match(html, /Future team/);
  assert.match(html, /No positions are currently advertised/);
  assert.match(html, /A shared vision\. A team to build\./);
  assert.match(html, /class="hero-cells"/);
  assert.match(html, /mailto:ivr4003@med.cornell.edu/);
  assert.doesNotMatch(html, /Lena Hart|Milo Chen|Nora Velez|Theo Mercer/);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
});

test("every published page has the understated SCB affiliation and official footer link", async () => {
  const files = await readdir(output, { recursive: true });
  for (const file of files.filter((name) => name.endsWith(".html") && name !== "404.html")) {
    const page = (await readFile(new URL(file, output), "utf8"))
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    assert.match(page, /class="brand-affiliation">@SCB</, file);
    assert.match(page, /class="footer-brand-affiliation">@SCB</, file);
    assert.doesNotMatch(page, /A lab in the making|seeking a home/i, file);
    const footer = page.match(/<footer\b[^>]*class="site-footer"[^>]*>([\s\S]*?)<\/footer>/i)?.[1];
    assert.ok(footer, `Missing footer: ${file}`);
    assert.match(footer, /<a class="footer-department" href="https:\/\/weill\.cornell\.edu\/units\/systems-and-computational-biomedicine">Systems and Computational Biomedicine · Weill Cornell Medicine<\/a>/, file);
  }
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
  const imageName = "og-til-cells-2026-09-30-v3.png";
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
  for (const previousName of ["og.png", "og-til-cells-2026-09.png", "og-til-cells-2026-09-30.png", "og-til-cells-2026-09-30-v2.png"]) {
    assert.deepEqual(await readFile(new URL(previousName, output)), image,
      `${previousName} must also serve the current preview`);
  }
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

test("homepage narration and social metadata speak as the laboratory", () => {
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const text = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(text, /Our research connects molecular invention/);
  assert.match(text, /Our goal is to build integrated technologies/);
  assert.match(text, /02 \/ Our approach/);
  assert.match(text, /Our vision for the Technology Innovation Lab is to bring curious minds together/);
  assert.match(text, /Contact us to exchange ideas/);
  assert.match(text, /For questions about our research/);
  assert.match(text, /Email us/);
  assert.match(text, /Ivan develops genomic and multiomic methods for studying individual cells/);
  assert.match(text, /His work contributes to our shared vision/);

  const metadata = [...markup.matchAll(/<meta\b[^>]*>/g)].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])),
  );
  for (const key of ["description", "og:description", "twitter:description"]) {
    const values = metadata.filter((tag) => tag.name === key || tag.property === key).map((tag) => tag.content);
    assert.deepEqual(values, ["Our research connects genomic and multiomic methods with automation. Explore our vision for the Technology Innovation Lab."]);
  }
  for (const key of ["og:title", "twitter:title"]) {
    const values = metadata.filter((tag) => tag.name === key || tag.property === key).map((tag) => tag.content);
    assert.deepEqual(values, ["Technology Innovation Lab"]);
  }
});

test("published pages do not restore personal-site narration", async () => {
  const files = await readdir(output, { recursive: true });
  for (const file of files.filter((name) => name.endsWith(".html") && name !== "404.html")) {
    // Inspect rendered copy and metadata, not code identifiers or the visitor's
    // URL-encoded mailto message. Attributed quotations retain their speaker.
    const page = (await readFile(new URL(file, output), "utf8"))
      .replace(/<(script|style|blockquote)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
    assert.doesNotMatch(page, /\b(?:my (?:research|vision|goals?)|contact me|his vision for a future Technology Innovation Lab)\b/i, file);
  }
});
