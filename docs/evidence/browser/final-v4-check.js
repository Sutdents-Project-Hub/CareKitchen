async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000/');
  await page.getByText('AI 對話', { exact: true }).waitFor();
  const chat = page.getByRole('textbox', { name: '描述今天想準備的餐點' });
  const send = async (text) => {
    await chat.fill(text);
    const [reply] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith('/api/chat') && response.request().method() === 'POST'),
      page.getByRole('button', { name: '送出訊息' }).click(),
    ]);
    assert(reply.status() === 200, 'HTTP 200 required');
    return reply.json();
  };
  const first = await send('我有豆腐150克、青菜120克和雞蛋2顆，今天做一人份晚餐，只有電鍋，預算100元。');
  assert(first.modelInfo?.promptVersion === 'carekitchen-v4' && first.modelInfo.model === 'gpt-6-luna', 'Real final model required');
  assert(first.cards.length >= 2, 'At least two meal cards');
  await page.locator('article.meal-card').first().waitFor();
  const updated = await send('這餐要無蛋，改成兩位一起吃，抓八十塊。');
  assert(updated.modelInfo?.promptVersion === 'carekitchen-v4', 'OpenAI used for this follow-up');
  assert(updated.context.servings === 2 && updated.context.budgetTwd === 80, 'Two servings and 80 TWD');
  assert(updated.context.excludedIngredients.includes('蛋') && updated.cards.length >= 1, 'Egg-free food options');
  assert(updated.cards.every(c => [...c.fromPantry, ...c.toBuy].every(x => x.name !== '雞蛋')), 'No excluded ingredient in cards');
  await page.getByText(/這輪已更新.*排除 蛋/).waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No phone-size horizontal overflow');
  await page.getByRole('link', { name: 'WAICY 實測紀錄' }).click();
  await page.getByRole('heading', { name: '十輪備餐對話實測' }).waitFor();
  assert(await page.getByRole('heading', { name: /第 \d+ 輪/ }).count() === 10, 'Ten recorded rounds');
  assert(await page.getByText('gpt-6-luna 與程式檢查', { exact: true }).count() === 7, 'Seven model-backed source labels');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Evidence works at phone size');
  await page.screenshot({ path: 'waicy-evidence-mobile.png' });
  return '390px V4 browser passed: genuine two-turn chat, no-egg budget change, ten-turn evidence, seven provenance labels';
}
