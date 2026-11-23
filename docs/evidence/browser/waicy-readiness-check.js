import assert from "node:assert/strict";
import { join } from "node:path";

export default async function checkWaicyReadiness(page, baseURL, screenshotDir) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL + "/evidence/waicy");
  await page.getByRole("heading", { name: "十輪備餐對話實測" }).waitFor();
  assert.equal(await page.getByRole("heading", { name: /第 \d+ 輪/ }).count(), 10);
  assert.equal(await page.getByText("gpt-6-luna 與程式檢查", { exact: true }).count(), 7);
  assert.equal(await page.locator(".evidence-recap[lang='en']").count(), 10);
  const guide = page.getByText("Try the live planner · English guide", { exact: true });
  await guide.focus();
  await guide.press("Enter");
  const followUp = await page.locator(".judge-guide blockquote").innerText();
  await guide.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(screenshotDir, "waicy-final-judge-guide.png") });

  const [planner] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: "Open CareKitchen in a new tab" }).click(),
  ]);
  await planner.getByText("AI 對話", { exact: true }).waitFor();
  const input = planner.getByRole("textbox", { name: "描述今天想準備的餐點" });
  const send = planner.getByRole("button", { name: "送出訊息" });
  const post = (button) => Promise.all([
    planner.waitForResponse((response) =>
      response.url().endsWith("/api/chat") && response.request().method() === "POST"),
    button.click(),
  ]).then(([response]) => response);

  await planner.getByRole("button", { name: /試試看一個例子/ }).click();
  const first = await post(send);
  assert.equal(first.status(), 200);
  const initial = await first.json();
  assert.equal(initial.modelInfo?.model, "gpt-6-luna");
  assert.equal(initial.context.servings, 1);
  assert.equal(initial.context.budgetTwd, 100);
  await planner.getByText("這道不用另外採買").first().waitFor();

  await planner.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      json: { message: "目前無法取得 OpenAI 回覆，您輸入的內容仍在，可以稍後重試。" },
    }),
  );
  await input.fill(followUp);
  assert.equal((await post(send)).status(), 503);
  await planner.getByRole("status").filter({ hasText: "目前無法取得 OpenAI 回覆" }).waitFor();
  assert.equal(await input.inputValue(), followUp);
  await planner.unroute("**/api/chat");

  const second = await post(planner.getByRole("button", { name: "重試", exact: true }));
  assert.equal(second.status(), 200);
  const updated = await second.json();
  assert.equal(updated.modelInfo?.model, "gpt-6-luna");
  assert.equal(updated.context.servings, 2);
  assert.equal(updated.context.budgetTwd, 80);
  assert.deepEqual(updated.context.equipment, ["rice_cooker"]);
  assert.deepEqual(updated.context.excludedIngredients, ["蛋"]);
  assert.ok(updated.cards.length >= 1);
  assert.ok(updated.cards.every((card) =>
    [...card.fromPantry, ...card.toBuy].every(({ name }) => name !== "雞蛋")));
  await planner.getByText(/這輪已更新.*排除 蛋/).waitFor();
  assert.equal(await planner.locator(".message-row.user").filter({ hasText: followUp }).count(), 1);
  assert.equal(await planner.getByText(/目前無法取得 OpenAI 回覆/).count(), 0);
  await planner.getByText("AI 對話", { exact: true }).waitFor();

  const cost = planner.locator(".meal-card .cost-line").first();
  await cost.waitFor();
  assert.equal(await cost.innerText(), "採買總額待確認");
  await planner.getByRole("button", { name: "預覽並複製餐點摘要" }).first().click();
  const preview = planner.getByRole("dialog");
  await preview.getByText(/採買金額：採買總額待確認/).waitFor();
  await planner.keyboard.press("Escape");
  assert.equal(await preview.count(), 0);

  await cost.scrollIntoViewIfNeeded();
  await planner.screenshot({ path: join(screenshotDir, "waicy-final-mobile-cost.png") });
  for (const width of [320, 390, 900]) {
    for (const tab of [page, planner]) {
      await tab.setViewportSize({ width, height: 844 });
      assert.ok(
        await tab.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Page must fit ${width} CSS pixels`,
      );
    }
  }
  return "10 recorded rounds, 7 model labels, 2 real API replies, 1 simulated HTTP 503 with a successful retry, and layouts at 320, 390 and 900 CSS px";
}
