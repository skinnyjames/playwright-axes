const glance = require("glance");
const test = require("tape");
const { chromium } = require("playwright");
const { child, parent, prevSibling, nextSibling } = require("../index");

const withBrowser = async (cb) => {
  const browser = await chromium.launch({ headless: false });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:8089/test.html`);
    await cb(page);
  } finally {
    await browser.close();
  }
};

const g = glance({
  dir: "./test/fixture",
  port: 8089,
  hideindex: false,
  nodot: true,
  verbose: true,
});

g.start();

test.onFinish(() => {
  console.warn("finishing");
  g.stop();
});

test("child finds elements in the document", async (t) => {
  const expected = `
      <div id="child-1">
        <div id="grandchild-1" class="bar">
          Bar
        </div>
      </div>
      <div id="child-2">
        <div id="grandchild-2" class="buzz">
          Buzz
        </div>
      </div>
      <div id="child-3">
        <div id="grandchild-3" class="foo">
          Foo
        </div>
      </div>
    `;
  await withBrowser(async (page) => {
    const byString = await page.locator(child({ id: "container" })).innerHTML();
    const byRegexp = await page.locator(child({ id: /contain/ })).innerHTML();
    const byMutliple = await page
      .locator(child({ id: "container", class: /is/ }))
      .innerHTML();

    t.equal(byString, expected);
    t.equal(byRegexp, expected);
    t.equal(byMutliple, expected);
    t.end();
  });
});

// anchors
test("anchors (start) grabs by the start of the attribute value", async (t) => {
  await withBrowser(async (page) => {
    const expected = ["Bar", "Buzz", "Foo"];
    const actual = await page.locator(child({ id: /^grandchild/ })).all();
    t.equal(actual.length, 3);

    for (let i = 0; i < 3; i++) {
      const text = await actual[i].innerText();
      t.equal(text, expected[i]);
    }

    t.end();
  });
});

test("anchors (start) grabs by the start of a case-insensitive attribute value", async (t) => {
  await withBrowser(async (page) => {
    const expected = ["Bar", "Buzz", "Foo"];
    const actual = await page.locator(child({ id: /^GrAndChIlD/i })).all();
    t.equal(actual.length, 3);

    for (let i = 0; i < 3; i++) {
      const text = await actual[i].innerText();
      t.equal(text, expected[i]);
    }

    t.end();
  });
});

test("anchors (end) grabs by the end of the attribute value", async (t) => {
  await withBrowser(async (page) => {
    const locators = await page.locator(child({ id: /child-2$/ })).all();
    t.equal(locators.length, 2);

    for (let i = 0; i < 2; i++) {
      const text = await locators[i].innerText();
      t.equal(text, "Buzz");
    }

    t.end();
  });
});

test("anchors (end) grabs by the end of a case-insensitive attribute value", async (t) => {
  await withBrowser(async (page) => {
    const locators = await page.locator(child({ id: /ChIlD-2$/i })).all();
    t.equal(locators.length, 2);

    for (let i = 0; i < 2; i++) {
      const text = await locators[i].innerText();
      t.equal(text, "Buzz");
    }

    t.end();
  });
});

// methods
test("child can nest children", async (t) => {
  await withBrowser(async (page) => {
    const expected = `Bar`;
    const actual = await page
      .locator(child({ id: "container" }))
      .locator(child({ class: /bar/ }))
      .innerText();

    t.equal(actual, expected);
    t.end();
  });
});

test("parent fetches a qualified ancestor", async (t) => {
  await withBrowser(async (page) => {
    const buzz = page.locator(child({ class: /buzz/ }));
    const buzzText = await buzz.innerText();
    const containerText = await buzz
      .locator(parent({ id: /contain/ }))
      .innerText();
    const bodyText = await buzz
      .locator(parent({ id: "container" }))
      .locator(parent({}, "body"))
      .innerText();

    t.equal(buzzText, "Buzz");
    t.equal(containerText, "Bar\nBuzz\nFoo");
    t.equal(bodyText, "Body\nBar\nBuzz\nFoo");
    t.end();
  });
});

test("nextSibling fetches the next DOM sibling", async (t) => [
  await withBrowser(async (page) => {
    const bar = page.locator(child({ id: "child-1" }));
    const buzz = await bar.locator(nextSibling({ id: /2/ })).innerText();
    const foo = await bar.locator(nextSibling({ id: /3/ })).innerText();

    t.equal(buzz, "Buzz");
    t.equal(foo, "Foo");
    t.end();
  }),
]);

test("prevSibling fetches the previous DOM sibling", async (t) => {
  await withBrowser(async (page) => {
    const foo = page.locator(child({ id: "child-3" }));
    const buzz = await foo.locator(prevSibling({ id: /2/ })).innerText();
    const bar = await foo.locator(prevSibling({ id: /1/ })).innerText();

    t.equal(buzz, "Buzz");
    t.equal(bar, "Bar");
    t.end();
  });
});

test("traverse tree", async (t) => {
  await withBrowser(async (page) => {
    const grandchild3 = page
      .locator(child({ id: "grandchild-2" }))
      .locator(parent({}, "div"))
      .locator(nextSibling({}, "div"))
      .locator(child({}, "div"));

    const text = await grandchild3.innerText();
    t.equal(text, "Foo");
    t.end();
  });
});

// Negative cases
test("child doesn't not returns parents or siblings", async (t) => {
  await withBrowser(async (page) => {
    const child1 = page.locator(child({ id: "child-1" }));
    const childIsVisible = await child1.isVisible();
    const sibling = await child1.locator(child({ id: "child-2" })).isVisible();
    const parent = await child1.locator(child({ id: "container" })).isVisible();

    t.equal(childIsVisible, true);
    t.equal(sibling, false);
    t.equal(parent, false);
    t.end();
  });
});

test("parent doesn't fetch siblings or children", async (t) => {
  await withBrowser(async (page) => {
    const child1 = page.locator(child({ id: "child-1" }));
    const childIsVisible = await child1.isVisible();
    const sibling = await child1.locator(parent({ id: "child-2" })).isVisible();
    const grandchild = await child1
      .locator(parent({ id: "grandchild-2" }))
      .isVisible();

    t.equal(childIsVisible, true);
    t.equal(sibling, false);
    t.equal(grandchild, false);
    t.end();
  });
});

test("nextSibling doesn't fetch previous siblings", async (t) => {
  await withBrowser(async (page) => {
    const child2 = page.locator(child({ id: "child-2" }));
    const prev = await child2
      .locator(nextSibling({ id: "child-1" }))
      .isVisible();
    const next = await child2
      .locator(nextSibling({ id: "child-3" }))
      .isVisible();

    t.equal(prev, false);
    t.equal(next, true);
    t.end();
  });
});

test("previousSibling doesn't fetch next siblings", async (t) => {
  await withBrowser(async (page) => {
    const child2 = page.locator(child({ id: "child-2" }));
    const prev = await child2
      .locator(prevSibling({ id: "child-1" }))
      .isVisible();
    const next = await child2
      .locator(prevSibling({ id: "child-3" }))
      .isVisible();

    t.equal(prev, true);
    t.equal(next, false);
    t.end();
  });
});
