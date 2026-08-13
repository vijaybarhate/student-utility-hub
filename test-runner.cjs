const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } }); // Mobile viewport
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  console.log("Navigating to homepage...");
  await page.goto('http://localhost:4321/');
  
  // Test Mobile Menu
  console.log("Testing mobile menu...");
  const menuBtn = page.locator('#mobile-menu-toggle');
  await menuBtn.click();
  await page.waitForTimeout(500);
  const menuDrawer = page.locator('#mobile-menu-drawer');
  const isMenuVisible = await menuDrawer.isVisible();
  console.log("Menu visible after click:", isMenuVisible);
  
  // Test Dark Mode Toggle
  console.log("Testing dark mode toggle...");
  const themeBtn = page.locator('#theme-toggle').first(); // If it exists
  if (await themeBtn.count() > 0) {
    await themeBtn.click();
    await page.waitForTimeout(200);
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    console.log("HTML classes after theme toggle:", htmlClass);
  }

  // Navigate to contact and test form
  console.log("Navigating to Contact page...");
  await page.goto('http://localhost:4321/contact');
  await page.fill('#user-name', 'Test User');
  await page.fill('#user-email', 'test@example.com');
  await page.fill('#message', 'This is a test message.');
  await page.click('#submit-btn');
  await page.waitForTimeout(500);
  const successBanner = await page.locator('#success-banner').isVisible();
  console.log("Success banner visible after submit:", successBanner);

  console.log("Errors logged:", errors);
  
  await browser.close();
})();
