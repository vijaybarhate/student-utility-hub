const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  
  const routes = [
    '/',
    '/attendance-calculator',
    '/gpa-calculator',
    '/cgpa-to-percentage',
    '/marks-needed-to-pass',
    '/atkt-eligibility-helper',
    '/contact',
    '/about'
  ];

  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    const url = `http://localhost:4321${route}`;
    console.log(`Checking ${url}...`);
    
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));
    
    await page.goto(url);
    await page.waitForTimeout(500); // let it render
    
    // Check for horizontal overflow (common mobile layout issue)
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      return docWidth > windowWidth;
    });
    
    if (overflow) {
      console.log(`❌ Overflow detected on ${route}!`);
    } else {
      console.log(`✅ Layout fits on ${route}`);
    }
    
    if (errors.length > 0) {
      console.log(`⚠️ Errors on ${route}:`, errors);
    }
    
    await context.close();
  }

  await browser.close();
})();
