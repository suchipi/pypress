it("launch", () => {
  py.launch({ headless: false });
});

it("close", () => {
  py.launch({ headless: false });
  py.close();
});

it("getDefaultPage", async () => {
  py.goto(FIXTURES + "/index.html");
  await expect(py).toHaveSelector("h1:withText(index)");

  py.newPage();
  await expect(py).not.toHaveSelector("h1:withText(index)");

  py.getDefaultPage();
  await expect(py).toHaveSelector("h1:withText(index)");
});

it("newPage", async () => {
  py.goto(FIXTURES + "/index.html");
  await expect(py).toHaveSelector("h1:withText(index)");

  py.newPage();
  await expect(py).not.toHaveSelector("h1:withText(index)");
});

it("goto", async () => {
  py.goto(FIXTURES + "/index.html");
  await expect(py).toHaveSelector("h1:withText(index)");

  py.goto(FIXTURES + "/other-page.html");
  await expect(py).toHaveSelector("h1:withText(other page)");
});

it("evaluate", async () => {
  const result = await py.evaluate(
    (some, input) => {
      return [some, input, "strings"].join(" ");
    },
    "Some",
    "input",
  );
  expect(result).toBe("Some input strings");
});

it("evaluateHandle", async () => {
  const body = await py.evaluateHandle(() => {
    return document.body;
  });
  expect(body).toBeDefined();
  const isSame = await py.evaluate((body) => {
    return document.body === body;
  }, body);
  expect(isSame).toBe(true);
});

it("go", async () => {
  py.goto(FIXTURES + "/index.html");
  await expect(py).toHaveSelector("h1:withText(index)");

  py.goto(FIXTURES + "/other-page.html");
  await expect(py).toHaveSelector("h1:withText(other page)");

  py.go("back");
  py.expectExists("h1:withText(index)");

  py.go("forward");
  py.expectExists("h1:withText(other page)");
});

it("hash", async () => {
  const hash = await py.hash();
  expect(hash).toMatchInlineSnapshot(`undefined`);
});

it("location", async () => {
  const location = await py.location();
  expect(location).toMatchInlineSnapshot();

  const host = await py.location("host");
  expect(host).toMatchInlineSnapshot();
});

it("reload", async () => {
  py.goto(FIXTURES + "/index.html");
  py.evaluate(() => {
    document.write(`<h2>Dynamic content</h2>`);
  });
  await expect(py).toHaveSelector("h2:withText(dynamic content)");
  py.reload();
  await expect(py).not.toHaveSelector("h2:withText(dynamic content)");
});

it("scrollIntoView", async () => {
  const el = await py.get("h1").first();
  py.evaluate((el) => {
    el.scrollIntoView = () => {
      window.didIt = true;
    };
  }, el);

  py.scrollIntoView();

  const didIt = await py.evaluate(() => window.didIt);
  expect(didIt).toBe(true);
});
