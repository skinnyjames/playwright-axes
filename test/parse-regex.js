const test = require("tape");
const { parseRegex } = require("../index");

test("parseRegex parses startAnchor if present", (t) => {
  const result = parseRegex(/^hello world/);
  t.equal(result.startAnchor, true);
  t.equal(result.endAnchor, false);
  t.end();
});

test("parseRegex parses endAnchor if present", (t) => {
  const result = parseRegex(/hello world$/);
  t.equal(result.startAnchor, false);
  t.equal(result.endAnchor, true);
  t.end();
});

test("parseRegex parses content correctly", (t) => {
  const result = parseRegex(/^hello world$/);
  t.equal(result.startAnchor, true);
  t.equal(result.endAnchor, true);
  t.equal(result.ignoreCase, false);
  t.end();
});

test("parseRegex honors ignoreCase flag", (t) => {
  const result = parseRegex(/^hello world$/i);
  t.equal(result.startAnchor, true);
  t.equal(result.endAnchor, true);
  t.equal(result.ignoreCase, true);
  t.end();
});
