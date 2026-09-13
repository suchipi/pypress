export {};

type Counts = {
  click: number;
  dblclick: number;
  contextmenu: number;
  auxButtons: Array<number>;
  mouseover: number;
  spotClick: number;
  tallClick: number;
};

const counts = (): Promise<Counts> =>
  py.evaluate(() => (window as any).counts);

// #target is absolutely positioned at 50,50 and is 100x40; #spot at 200,200, 60x60
const TARGET_CENTER: [number, number] = [100, 70];
const SPOT_CENTER: [number, number] = [230, 230];

it("click on the selected element", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").click();

  expect((await counts()).click).toBe(1);
});

it("click with a selector", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.click("#target");

  expect((await counts()).click).toBe(1);
});

it("click with coordinates", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.click(...SPOT_CENTER);

  const result = await counts();
  expect(result.spotClick).toBe(1);
  expect(result.click).toBe(0);
});

it("click scrolls the element into view first", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#tall").click();

  expect((await counts()).tallClick).toBe(1);
});

it("click throws when there is no page", async () => {
  await expect(py.click("#target")).rejects.toThrow("No page present");

  // re-arm the chain so the `await py` in the test wrapper doesn't re-throw
  await py.sleep(1);
});

it("click throws when nothing is selected", async () => {
  py.goto(FIXTURES + "/mouse.html");

  await expect(py.click()).rejects.toThrow("No element selected");

  await py.sleep(1);
});

it("rightClick on the selected element", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").rightClick();

  const result = await counts();
  expect(result.contextmenu).toBe(1);
  expect(result.click).toBe(0);
});

it("rightClick with coordinates", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.rightClick(...TARGET_CENTER);

  expect((await counts()).contextmenu).toBe(1);
});

it("rightClick with a selector", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.rightClick("#target");

  const result = await counts();
  expect(result.contextmenu).toBe(1);
  expect(result.click).toBe(0);
});

it("rightclick is an alias for rightClick", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").rightclick();

  expect((await counts()).contextmenu).toBe(1);
});

it("middleClick on the selected element", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").middleClick();

  const result = await counts();
  expect(result.auxButtons).toEqual([1]);
  expect(result.click).toBe(0);
});

it("middleClick with coordinates", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.middleClick(...TARGET_CENTER);

  expect((await counts()).auxButtons).toEqual([1]);
});

it("middleClick with a selector", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.middleClick("#target");

  const result = await counts();
  expect(result.auxButtons).toEqual([1]);
  expect(result.click).toBe(0);
});

it("hover over the selected element", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").hover();

  const result = await counts();
  expect(result.mouseover).toBe(1);
  expect(result.click).toBe(0);
});

it("hover with a selector", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.hover("#target");

  const result = await counts();
  expect(result.mouseover).toBe(1);
  expect(result.click).toBe(0);
});

it("hover with coordinates", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.hover(...TARGET_CENTER);

  expect((await counts()).mouseover).toBe(1);
});

it("moveMouse is an alias for hover", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.moveMouse(...TARGET_CENTER);

  expect((await counts()).mouseover).toBe(1);
});

it("doubleClick", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").doubleClick();

  expect((await counts()).click).toBe(2);
});

it("dblclick is an alias for doubleClick", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.get("#target").dblclick();

  expect((await counts()).click).toBe(2);
});

it("doubleClick with coordinates", async () => {
  py.goto(FIXTURES + "/mouse.html");

  py.doubleClick(...SPOT_CENTER);

  expect((await counts()).spotClick).toBe(2);
});
