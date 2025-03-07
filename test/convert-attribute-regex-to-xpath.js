const test = require("tape");
const { convertAttributeRegexToXpath } = require("../index");

test("converts case insensitive attributes with anchor(start)", (t) => {
  const actual = convertAttributeRegexToXpath("class", /^startofClass/i);
  t.equal(
    actual,
    `@class[starts-with(normalize-space(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')), 'startofclass')]`,
  );
  t.end();
});

test("converts case insensitive attributes with anchor(end)", (t) => {
  const actual = convertAttributeRegexToXpath("class", /endOfClass$/i);
  t.equal(
    actual,
    `substring(normalize-space(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')), string-length(normalize-space(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))) - string-length('endofclass') + 1) = 'endofclass'`,
  );
  t.end();
});

test("converts case sensitive attributes with anchor(start)", (t) => {
  const actual = convertAttributeRegexToXpath("class", /^startofClass$/);
  t.equal(actual, `@class[starts-with(normalize-space(.),'startofClass')]`);
  t.end();
});

test("converts case sensitive attributes with anchor(end)", (t) => {
  const actual = convertAttributeRegexToXpath("class", /endOfClass$/);
  t.equal(
    actual,
    `substring(normalize-space(@class), string-length(normalize-space(@class)) - string-length('endOfClass') + 1) = 'endOfClass'`,
  );
  t.end();
});

test("converts case insensitive attributes without anchor", (t) => {
  const actual = convertAttributeRegexToXpath("class", /middle-class/i);
  t.equal(
    actual,
    `contains(translate(@class,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'middle-class')`,
  );
  t.end();
});

test("converts case sensitive attributes without anchor", (t) => {
  const actual = convertAttributeRegexToXpath("class", /miDdle-claSs/);
  t.equal(actual, `contains(@class, 'miDdle-claSs')`);
  t.end();
});
