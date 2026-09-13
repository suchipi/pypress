export {};

const namesOf = (cookies: Array<{ name: string }>): Array<string> =>
  cookies.map((cookie) => cookie.name).sort();

it("getCookies", async () => {
  py.goto(FIXTURES + "/storage.html");

  const cookies = await py.getCookies();

  expect(namesOf(cookies)).toEqual(["alpha", "beta"]);
});

it("getCookies records the cookies on the context", async () => {
  py.goto(FIXTURES + "/storage.html");

  py.getCookies();
  const context = await py.getContext();

  expect(namesOf(context.cookies!)).toEqual(["alpha", "beta"]);
});

it("getCookie", async () => {
  py.goto(FIXTURES + "/storage.html");

  const cookie = await py.getCookie("alpha");

  expect(cookie).not.toBe(null);
  expect(cookie!.name).toBe("alpha");
  expect(cookie!.value).toBe("one");
});

it("getCookie returns null when the cookie is not set", async () => {
  py.goto(FIXTURES + "/storage.html");

  expect(await py.getCookie("nope")).toBe(null);
});

it("clearCookie", async () => {
  py.goto(FIXTURES + "/storage.html");

  py.clearCookie("alpha");
  const cookies = await py.getCookies();

  expect(namesOf(cookies)).toEqual(["beta"]);
});

it("clearCookie leaves the other cookies alone", async () => {
  py.goto(FIXTURES + "/storage.html");

  py.clearCookie("alpha");

  expect(await py.getCookie("alpha")).toBe(null);
  expect((await py.getCookie("beta"))!.value).toBe("two");
});

it("clearCookies", async () => {
  py.goto(FIXTURES + "/storage.html");

  py.clearCookies();
  const cookies = await py.getCookies();

  expect(cookies).toEqual([]);
});

it("cookies set after load are visible too", async () => {
  py.goto(FIXTURES + "/storage.html");
  py.evaluate(() => {
    document.cookie = "gamma=three; path=/";
  });

  const cookie = await py.getCookie("gamma");

  expect(cookie!.value).toBe("three");
});
