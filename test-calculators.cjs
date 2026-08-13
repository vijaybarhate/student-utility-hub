const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const routes = [
    '/attendance-calculator',
    '/gpa-calculator',
    '/cgpa-to-percentage',
    '/marks-needed-to-pass',
    '/atkt-eligibility-helper'
  ];

  for (const route of routes) {
    console.log(`\nTesting ${route}...`);
    await page.goto(`http://localhost:4321${route}`);
    await page.waitForTimeout(500);
    
    const inputs = await page.locator('input[type="number"]');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
       try { await inputs.nth(i).fill('10'); } catch(e) {}
    }
    
    await page.waitForTimeout(500);
  }

  console.log("\nErrors logged across calculators:", errors);
  await browser.close();
})();
