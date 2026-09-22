import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

const response = await render();
const html = await response.text();

test("the production worker serves the lab with meaningful server-rendered content", () => {
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /<title>Ivan Raimondi \| Technology Innovation Lab<\/title>/);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
  assert.match(html, /Single-cell mapping of regulatory DNA-protein interactions/);
  assert.match(html, /mailto:ivr4003@med.cornell.edu/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("every internal navigation link has a destination", () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const destinations = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]));
  assert.ok(destinations.size > 0);
  for (const destination of destinations) {
    assert.ok(ids.has(destination), `Missing destination: #${destination}`);
  }
});

test("the cellular hero starts without a skyline image before hydration", () => {
  assert.match(html, /class="hero-cell-background"/);
  assert.match(html, /<canvas\b[^>]*class="hero-cells"/);
  assert.doesNotMatch(html, /class="[^"]*\bhero-image\b[^"]*"/);
});

test("the opening sequence is selected in the initial HTML with a no-script fallback", () => {
  assert.match(html, /class="site-shell"[^>]*data-intro="cinematic"/);
  assert.match(html, /<noscript><style>[\s\S]*?visibility: visible !important[\s\S]*?<\/style><\/noscript>/);
});

test("the hero keeps the Cornell signature without the removed buttons and location", () => {
  const hero = html.match(/<section\b[^>]*id="home"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(hero);
  assert.match(hero, /class="hero-bottom"/);
  assert.match(hero, /alt="Weill Cornell Medicine"/);
  assert.doesNotMatch(hero, /Explore our research|Contact the lab|New York, NY|hero-actions|hero-location/);
});

test("every local image referenced by the page is included in the public assets", async () => {
  const images = new Set([...html.matchAll(/<img\b[^>]*\bsrc="(\/[^"]+)"/g)].map((match) => match[1]));
  assert.ok(images.size > 0);
  for (const image of images) {
    await access(new URL(`../public${image}`, import.meta.url));
  }
});
