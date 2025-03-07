# playwright-axes

Helper functions to assist with locating various node axes using xpath

Supports

* Locating by parent, children, and siblings
* Arbitrary attribute lookups using regex

## install

`npm i -D playwright-axes`

## usage

```javascript
const { chromium } = require("playwright");
const { child, parent, nextSibling, prevSibling } = require('playwright-axes');

const browser = await chromium.launch({headless: false})
const context = await browser.newContext();
const page = await context.newPage();

await page.goto('https://www.w3schools.com/xml');

// functions take an object with keys that represent attribute names
// values support a subset of regexp (anchors and case insensitive flag)
const xpathAxesLink = page.locator(child({ href: /^xpath_axes/i }))

// function take an optional second parameter for the node/tag name
// this also works
const xpathAxesLink2 = page.locator(child({href: /^xpath_axes/}, "a"))

// to omit attribute search, pass an empty object as the first parameter
const xpathOperatorsLink = xpathAxesLink.locator(nextSibling({})).first();
const xpathSyntaxLink = xpathAxesLink.locator(prevSibling({})).last();

await xpathOperatorsLink.click();
```

## license

MIT


