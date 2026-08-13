const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  
  const routes = ['/attendance-calculator', '/gpa-calculator', '/atkt-eligibility-helper'];
  
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(`http://localhost:4321${route}`);
    await page.waitForTimeout(500);
    
    console.log(`\nChecking deepest overflow for ${route}...`);
    
    const overflowing = await page.evaluate(() => {
      const windowWidth = window.innerWidth;
      const elements = document.querySelectorAll('*');
      let deepest = [];
      let minArea = Infinity;
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > windowWidth && el.tagName.toLowerCase() !== 'html' && el.tagName.toLowerCase() !== 'body') {
          // Identify elements that have no overflowing children
          const children = el.children;
          let hasOverflowingChild = false;
          for(let i=0; i<children.length; i++) {
              const crect = children[i].getBoundingClientRect();
              if(crect.right > windowWidth) {
                  hasOverflowingChild = true;
                  break;
              }
          }
          if (!hasOverflowingChild) {
              deepest.push({
                  tag: el.tagName.toLowerCase(),
                  class: el.className,
                  text: el.innerText ? el.innerText.substring(0,30) : '',
                  width: rect.width
              });
          }
        }
      });
      return deepest;
    });
    
    console.log(overflowing);
  }
  
  await browser.close();
})();
