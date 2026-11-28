import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const roleButtons = {
  elder: /Cooking for myself/,
  caregiver: /Cooking for someone I care for/,
  family: /Planning with family/,
};
const fixture = [
  "Dinner for 1",
  "I have eggs 2 items and tomatoes 300 g, and a stove. My budget is NT$80.",
  "Why did you choose these?",
  "I want something different",
  "Make it for 2, no eggs. Keep everything else.",
  "I also have tofu 300 g and leafy greens 240 g.",
  "Can you make a shopping list?",
  "Pumpkin 300 g costs NT$45 per package. Can you confirm the total is within my NT$80 budget?",
  "I only have an oven.",
  "I only have a microwave.",
];
const rolePrompt =
  "Dinner for 2. I have tofu 300 g and leafy greens 240 g, and a rice cooker. No eggs. My budget is NT$80.";
const expectedModelRounds = new Set([2, 4, 6, 7, 8, 10]);

export default async function checkV6(browser, baseUrl, outputDir, expectModel = true) {
  await mkdir(outputDir, { recursive: true });
  const browserErrors = [];
  const newRole = async (role, width = 1440) => {
    const page = await browser.newPage({ viewport: { width, height: 1030 } });
    page.setDefaultTimeout(20000);
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.goto(baseUrl);
    await page.getByRole("button", { name: roleButtons[role] }).first().click();
    await page.getByRole("textbox", { name: "Describe the meal you want to make" }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    return page;
  };

  async function send(page, text, expectedModel) {
    await page.getByRole("textbox", { name: "Describe the meal you want to make" }).fill(text);
    const [response] = await Promise.all([
      page.waitForResponse((r) => new URL(r.url()).pathname === "/api/chat" && r.request().method() === "POST"),
      page.getByRole("button", { name: "Send message", exact: true }).click(),
    ]);
    assert.equal(response.status(), 200, text);
    const body = await response.json();
    await page.locator(".message-row.assistant").getByText(body.message, { exact: true }).last().waitFor();
    assert.equal(await page.locator(".meal-card").count(), body.cards.length, text);
    assert.equal(body.modelInfo?.promptVersion ?? null, expectModel && expectedModel ? "carekitchen-en-v6" : null, body.message + " | " + text);
    return { text, httpStatus: response.status(), request: response.request().postDataJSON(), reply: body };
  }

  function capture(locator, filename) {
    return locator.screenshot({ path: join(outputDir, filename + ".png"), animations: "disabled" });
  }

  const conversation = await newRole("elder", 430);
  const turns = [];
  for (const [index, text] of fixture.entries()) {
    turns.push(await send(conversation, text, expectedModelRounds.has(index + 1)));
  }
  const [start, ingredients, why, swap, resized, pantry, shopping, budget, oven, recovered] =
    turns.map(({ reply }) => reply);
  assert.equal(start.context.servings, 1);
  assert.match(start.message, /confirm equipment/i);
  assert.equal(ingredients.cards[0].id, "stove-egg-tomato");
  assert.deepEqual(why.cards.map(({ id }) => id), ingredients.cards.map(({ id }) => id));
  assert.match(why.message, /tomatoes/i);
  assert.ok(swap.cards.length && swap.cards.every(({ id }) => !why.cards.some((card) => card.id === id)));
  assert.equal(resized.context.servings, 2);
  assert.deepEqual(resized.context.excludedIngredients, ["eggs"]);
  assert.equal(resized.cards.length, 0);
  assert.match(resized.message, /catalog|recipe/i);
  assert.equal(pantry.cards[0].id, "boil-greens-tofu");
  assert.equal(shopping.responseType, "shopping_summary");
  assert.match(budget.message, /cannot be confirmed|within TWD 80/i);
  assert.equal(budget.context.purchasePrices.find(({ name }) => name === "pumpkin")?.priceTwd, 45);
  assert.equal(oven.cards.length, 0);
  assert.deepEqual(oven.context.equipment, []);
  assert.ok(oven.context.pantryItems.every(({ name }) => !/oven/i.test(name)));
  assert.ok(recovered.cards.length && recovered.cards.every(({ equipment }) => equipment === "microwave"));
  assert.deepEqual(recovered.context.excludedIngredients, ["eggs"]);
  assert.equal(recovered.context.budgetTwd, 80);
  assert.ok(await conversation.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await capture(conversation.locator(".meal-card").first(), "mobile-recovery");
  await conversation.close();

  const roles = {};
  let caregiverUpdate;
  for (const role of Object.keys(roleButtons)) {
    const page = await newRole(role);
    roles[role] = await send(page, rolePrompt, true);
    const firstCard = page.locator(".meal-card").first();
    if (role === "elder") {
      await firstCard.getByRole("button", { name: "View simple steps" }).click();
      await firstCard.getByRole("list").waitFor();
      await capture(firstCard, "role-elder-cooking");
    } else if (role === "caregiver") {
      assert.match(await firstCard.innerText(), /2 servings/);
      caregiverUpdate = await send(page, "Make it for 3, no tofu. Keep the rice cooker. I also have cabbage 450 g and carrots 180 g.", true);
      assert.equal(caregiverUpdate.reply.cards[0].id, "steam-cabbage-carrot");
      const checkedCard = await firstCard.innerText();
      assert.match(checkedCard, /3 servings/);
      assert.match(checkedCard, /Excluded ingredients: eggs, tofu/);
      await capture(firstCard, "role-caregiver-constraints");
    } else {
      const cardWithPurchase = page.locator(".meal-card").filter({ hasText: /price to confirm/ }).first();
      const opener = cardWithPurchase.getByRole("button", { name: "Preview and copy meal summary" });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: "Preview what you will share" });
      assert.match(await dialog.innerText(), /(?:shopping|buy)/i);
      await capture(dialog, "role-family-handoff");
      await page.keyboard.press("Escape");
      assert.equal(await dialog.count(), 0);
      assert.ok(await opener.evaluate((button) => button === document.activeElement));
    }
    await page.close();
  }
  assert.equal(roles.elder.reply.cards.length, 2);
  assert.equal(roles.caregiver.reply.cards.length, 3);
  assert.equal(roles.family.reply.responseType, "shopping_summary");

  const edge = await newRole("elder", 430);
  const medical = await send(edge, "Can I change my medication dose so I can eat this?", false);
  assert.equal(medical.reply.responseType, "professional_referral");
  assert.equal(medical.reply.cards.length, 0);
  const pantryInput = edge.getByLabel("Ingredients available at home");
  await pantryInput.fill("eggs, tomatoes");
  const stoveButton = edge.getByRole("button", { name: "Stovetop", exact: true });
  await stoveButton.click();
  const equipmentFirstClick = (await stoveButton.getAttribute("aria-pressed")) === "true";
  await edge.close();
  assert.ok(equipmentFirstClick, "Equipment should toggle on the first click after pantry edits");
  assert.deepEqual(browserErrors, []);
  const result = {
    executedAt: new Date().toISOString(), baseUrl, operator: "Codex via Playwright",
    kind: "Scripted UI operation with fictional inputs", turns, roles, caregiverUpdate, medical, equipmentFirstClick,
  };
  await writeFile(join(outputDir, "walkthrough.json"), JSON.stringify(result, null, 2) + "\n");
  return result;
}
