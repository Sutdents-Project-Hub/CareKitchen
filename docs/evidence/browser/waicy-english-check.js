import assert from "node:assert/strict";
import { join } from "node:path";

const personas = {
  elder: /Cooking for myself/,
  caregiver: /Cooking for someone I care for/,
  family: /Planning with family/,
};

const fixture = [
  "I am cooking dinner for 1 person. I have tofu 150 g, leafy greens 120 g and eggs 2 items. I only have a rice cooker. My budget is NT$100. Please suggest two meals.",
  "Make it for 2 people, with a budget of NT$80 and no eggs. Keep everything else.",
  "Tofu 300 g costs NT$45 per package. Vegetable prices are unknown. Can you confirm the total is within my NT$80 budget?",
];

export default async function checkEnglishReview(browser, baseUrl, screenshotDir) {
  const rows = [];
  const mobile = { width: 430, height: 960 };
  const desktop = { width: 1440, height: 1000 };

  async function open(viewport, path = "/") {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
    page.setDefaultTimeout(18000);
    await page.goto(baseUrl + path);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    return page;
  }

  async function english(page) {
    const text = await page.locator("body").innerText();
    assert.ok(!/\p{Script=Han}/u.test(text));
    assert.ok(!/\b1 (?:people|servings|meals)\b/i.test(text));
  }

  async function capture(page, filename, target) {
    await english(page);
    const options = { path: join(screenshotDir, filename + ".png"), animations: "disabled", caret: "hide" };
    if (target) await target.screenshot(options);
    else await page.screenshot(options);
  }

  async function select(page, role) {
    await page.getByRole("button", { name: personas[role] }).click();
    await page.getByText("AI planner", { exact: true }).waitFor();
  }

  async function send(page, text, type, withModel = true) {
    const input = page.getByRole("textbox", { name: "Describe the meal you want to make" });
    const sendPost = async (button) => {
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().endsWith("/api/chat") && r.request().method() === "POST"),
        button.click(),
      ]);
      return response;
    };
    await input.fill(text);
    let response = await sendPost(page.getByRole("button", { name: "Send message", exact: true }));
    const statuses = [response.status()];
    if (response.status() === 503) {
      response = await sendPost(page.getByRole("button", { name: "Try again", exact: true }));
      statuses.push(response.status());
    }
    assert.equal(response.status(), 200, text);
    const body = await response.json();
    assert.equal(body.responseType, type, text);
    assert.equal(body.modelInfo?.model ?? null, withModel ? "gpt-6-luna" : null, text);
    if (withModel) assert.equal(body.modelInfo.promptVersion, "carekitchen-en-v5");
    await page.locator(".message-row.assistant").getByText(body.message, { exact: true }).last().waitFor();
    if (body.cards.length) await page.locator(".meal-card").first().waitFor();
    assert.equal(await page.locator(".meal-card").count(), body.cards.length);
    await english(page);
    rows.push({ text, responseType: type, statuses, model: body.modelInfo?.model ?? null, cards: body.cards.length });
    return body;
  }

  const olderAdult = await open(desktop);
  await olderAdult.getByRole("button", { name: personas.elder }).waitFor();
  await capture(olderAdult, "01-role-selection");
  await select(olderAdult, "elder");

  const first = await send(olderAdult, fixture[0], "meal_candidates");
  assert.equal(first.context.servings, 1);
  assert.equal(first.context.budgetTwd, 100);
  assert.equal(first.cards.length, 2);
  assert.ok(first.cards.some((card) => card.toBuy.length === 0));
  await capture(olderAdult, "02-elder-live-first-reply", olderAdult.locator("#workspace"));

  const changed = await send(olderAdult, fixture[1], "meal_candidates");
  assert.equal(changed.context.servings, 2);
  assert.equal(changed.context.budgetTwd, 80);
  assert.deepEqual(changed.context.excludedIngredients, ["eggs"]);
  assert.deepEqual(changed.context.equipment, ["rice_cooker"]);
  assert.ok(changed.cards.every((card) =>
    [...card.fromPantry, ...card.toBuy].every(({ name }) => name !== "eggs")));
  await capture(olderAdult, "03-elder-live-condition-change", olderAdult.locator("#workspace"));

  const pricing = await send(olderAdult, fixture[2], "meal_candidates");
  assert.match(pricing.message, /total.*cannot be confirmed/i);
  assert.ok(pricing.cards.some((card) => card.knownCostTwd === 45 && card.missingPrices.length > 0));
  assert.ok(pricing.cards.every((card) => card.budgetStatus === "unknown"));
  await capture(olderAdult, "04-elder-live-price-check", olderAdult.locator("#workspace"));
  await capture(olderAdult, "10-english-dialogue-detail", olderAdult.locator(".conversation-feed"));
  await capture(olderAdult, "11-english-cost-cards", olderAdult.locator("#meal-results"));

  const caregiver = await open(mobile);
  await select(caregiver, "caregiver");
  const care = await send(caregiver,
    "I am cooking dinner for 2 people. I have tofu 300 g, leafy greens 240 g and eggs 2 items. I only have a rice cooker. My budget is NT$120. No eggs. Please suggest two meals.",
    "meal_candidates",
  );
  assert.equal(care.cards.length, 2);
  assert.deepEqual(care.context.excludedIngredients, ["eggs"]);
  assert.ok(care.cards.every((card) => card.servings === 2 &&
    [...card.fromPantry, ...card.toBuy].every(({ name }) => name !== "eggs")));
  await capture(caregiver, "05-caregiver-live-egg-exclusion", caregiver.locator(".planning-column"));

  const family = await open(mobile);
  await select(family, "family");
  const share = await send(family,
    "I am cooking dinner for 3 people. I have tofu 150 g and leafy greens 120 g. I only have a rice cooker. My budget is NT$120. Please make a shopping list.",
    "shopping_summary",
  );
  assert.ok(share.cards.find((card) => card.missingPrices.length));
  await family.getByRole("button", { name: "Preview and copy meal summary" }).first().click();
  const preview = family.getByRole("dialog", { name: "Preview what you will share" });
  await preview.getByRole("button", { name: "Copy summary" }).waitFor();
  assert.match(await preview.innerText(), /need to buy|to buy|what to buy/i);
  await capture(family, "06-family-live-shopping-preview", preview);

  const medical = await open(mobile);
  await select(medical, "elder");
  const referral = await send(medical,
    "I take medication. Can you guarantee these meals are safe?",
    "professional_referral", false,
  );
  assert.equal(referral.cards.length, 0);
  await capture(medical, "07-safety-professional-referral", medical.locator("#conversation"));

  const transcript = await open({ width: 1120, height: 1020 }, "/evidence/waicy");
  assert.equal(await transcript.getByRole("heading", { name: /^Round \d+$/ }).count(), 10);
  assert.equal(await transcript.getByText("gpt-6-luna and server checks", { exact: true }).count(), 7);
  await transcript.getByText("Try the live assistant", { exact: true }).click();
  await transcript.getByRole("link", { name: "Open CareKitchen in a new tab." }).waitFor();
  await transcript.evaluate(() => window.scrollTo(0, 0));
  await capture(transcript, "08-waicy-transcript-and-guide");
  const round = transcript.locator('article[aria-labelledby="round-6"]');
  await round.getByText(/full totals cannot be confirmed/i).waitFor();
  await capture(transcript, "09-waicy-recorded-budget-round", round);

  for (const width of [320, 390, 900, 1440]) {
    for (const page of [olderAdult, transcript]) {
      await page.setViewportSize({ width, height: 960 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width);
    }
  }
  return rows;
}
