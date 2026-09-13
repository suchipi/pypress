it("should('navigate')", async () => {
  py.goto(FIXTURES + "/nav.html");
  await expect(py).toHaveSelector("h1:withText(nav)");

  py.click("#go");
  py.should("navigate");

  await expect(py).toHaveSelector("h1:withText(other page)");
});

it("should:navigate", async () => {
  py.goto(FIXTURES + "/nav.html");

  py.click("#go");
  py["should:navigate"]();

  const href = await py.location("href");
  expect(href).toBe(FIXTURES + "/other-page.html");
});

it("should('navigate') resolves before the next command runs", async () => {
  py.goto(FIXTURES + "/nav.html");

  py.click("#go");
  py.should("navigate");

  // no retrying `get` here: the page must already be the new one
  const heading = await py.evaluate(
    () => (document.querySelector("h1") as HTMLElement).textContent,
  );
  expect(heading).toBe("Other Page");
});
