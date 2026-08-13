// Plain Node smoke test using Playwright (no test framework).
// Serves static dist/ and audits every tool page in a 375px viewport:
//   - no horizontal scroll
//   - no console errors
//   - primary interactive elements present and clickable
//   - dark mode toggle flips the theme without throwing
// Run: node tests/smoke.cjs  (requires the static server on PORT)

const { chromium } = require('playwright');

const BASE = process.env.SMOKE_BASE || 'http://localhost:8123';
const PAGES = [
  '/',
  '/attendance-calculator/',
  '/cgpa-to-percentage/',
  '/gpa-calculator/',
  '/marks-needed-to-pass/',
  '/atkt-eligibility-helper/',
  '/exam-countdown/',
  '/study-timer/',
  '/semester-tracker/',
  '/marks-ledger/',
];

let failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log('PASS:', msg);
  } else {
    console.log('FAIL:', msg);
    failed += 1;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  for (const path of PAGES) {
    const url = BASE + path;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      return {
        scrollW: Math.max(doc.scrollWidth, body.scrollWidth),
        viewportW: doc.clientWidth,
        overflowX: doc.scrollWidth > doc.clientWidth,
        buttons: document.querySelectorAll('button, a[href], select, input, [role="button"]').length,
      };
    });

    assert(
      !metrics.overflowX,
      `${path} — no horizontal scroll (scrollWidth ${metrics.scrollW} ≤ ${metrics.viewportW})`
    );
    assert(
      metrics.buttons >= 1,
      `${path} — has interactive elements (${metrics.buttons})`
    );

    // Interactive smoke: click every visible non-nav button, catch thrown errors.
    const clickErrors = await page.evaluate(() => {
      const errors = [];
      const buttons = Array.from(document.querySelectorAll('button'));
      buttons.forEach((btn, i) => {
        if (btn.closest('nav') || btn.closest('header')) return;
        if (btn.disabled) return;
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        try {
          btn.click();
        } catch (e) {
          errors.push(`button#${i} ("${btn.textContent.trim().slice(0, 30)}"): ${e.message}`);
        }
      });
      return errors;
    });
    assert(clickErrors.length === 0, `${path} — clicking buttons did not throw${clickErrors.length ? ': ' + clickErrors.join(' | ') : ''}`);

    // Dark mode toggle still works.
    const toggle = await page.$('#theme-toggle, [data-theme-toggle], header button[aria-label*="theme" i]');
    if (toggle) {
      const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      await toggle.click();
      await page.waitForTimeout(150);
      const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      assert(before !== after, `${path} — dark mode toggle flips theme`);
      await toggle.click();
      await page.waitForTimeout(100);
    } else {
      assert(false, `${path} — theme toggle present`);
    }

    assert(consoleErrors.length === 0, `${path} — no console errors${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`);
    consoleErrors.length = 0;
  }

  await browser.close();

  if (failed > 0) {
    console.error(`\n${failed} smoke check(s) FAILED`);
    process.exit(1);
  }
  console.log('\nALL PASS — 375px smoke audit');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
