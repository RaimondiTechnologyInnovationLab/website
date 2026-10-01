import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/technologies/content.ts", import.meta.url), "utf8");
async function loadContent(sourceText = source) {
  const { outputText } = ts.transpileModule(sourceText.replace(/^import "server-only";\s*/m, ""), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const content = await loadContent();

test("technology lookup exposes only the approved D&D-seq record", () => {
  assert.deepEqual(content.getPublishedTechnologies().map(({ slug }) => slug), ["dnd-seq"]);
  assert.equal(content.getTechnology("missing"), undefined);
  assert.equal(content.getTechnology("dnd-seq").resources.length, 2);
});

test("a new record supplies its own metadata and contact while drafts stay private", async () => {
  const original = content.getTechnology("dnd-seq");
  const future = { ...original, slug: "future-method", name: "Future method", access: { ...original.access, email: "research@example.org" } };
  const draft = { ...original, slug: "draft-method", status: "draft" };
  const parsed = ts.createSourceFile("content.ts", source, ts.ScriptTarget.Latest, true);
  const declaration = parsed.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations)
    .find((declaration) => declaration.name.getText(parsed) === "technologies");
  assert.ok(declaration?.initializer);
  const fixture = await loadContent(source.slice(0, declaration.initializer.getStart(parsed)) + JSON.stringify([original, future, draft]) + source.slice(declaration.initializer.end));
  assert.deepEqual(fixture.getPublishedTechnologies().map(({ slug }) => slug), ["dnd-seq", "future-method"]);
  assert.equal(fixture.getTechnology("draft-method"), undefined);
  assert.match(fixture.getTechnologyMetadata(future).alternates.canonical, /\/future-method\/$/);
  const contact = new URL(fixture.technologyContactHref(future));
  assert.equal(contact.pathname, "research@example.org");
  assert.equal(contact.searchParams.get("subject"), "Future method — starter kit interest");
  assert.ok(contact.searchParams.get("body").includes("Future method"));
});

test("the enquiry keeps the visitor as the speaker", () => {
  const technology = content.getTechnology("dnd-seq");
  const contact = new URL(content.technologyContactHref(technology));
  assert.equal(contact.pathname, "ivr4003@med.cornell.edu");
  assert.match(contact.searchParams.get("body"), /^Hello Ivan,\n\nI’m interested in trying D&D-seq\./);
  assert.match(technology.access.description, /Tell us about your research question/);
  assert.match(technology.access.description, /We can discuss/);
});
