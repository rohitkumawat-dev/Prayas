import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'laptop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x720', width: 1280, height: 720 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-375x667', width: 375, height: 667 },
];

async function testResponsive() {
  console.log('=== TESTING ADMIN APPROVAL RESPONSIVE VIEWPORTS ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // Login as Super Admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Open Admin Users
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('table');
    await page.waitForTimeout(1000);

    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`  Horizontal overflow: ${hasHorizontalOverflow ? 'YES (FAIL)' : 'NO (PASS)'}`);
    await page.screenshot({ path: `admin-users-${vp.name}.png` });
    await context.close();
  }

  await browser.close();
  console.log('\n==========================================');
  console.log('RESPONSIVE VIEWPORT CHECKS COMPLETED');
  console.log('==========================================\n');
}

testResponsive();
