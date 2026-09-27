import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const viewports = [
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'laptop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1280x720', width: 1280, height: 720 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-375x667', width: 375, height: 667 },
];

async function testHeroViewports() {
  console.log('=== TESTING LANDING HERO AT 5 VIEWPORTS ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const results = [];

  for (const vp of viewports) {
    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('canvas');
    await page.waitForTimeout(1000); // allow particles to settle

    // 1. Check for horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // 2. Measure canvas dimensions
    const canvas = page.locator('canvas').first();
    const canvasBox = await canvas.boundingBox();

    // 3. Check headline and CTA visibility in initial viewport
    const cta = page.locator('a:has-text("Start Learning")');
    const ctaBox = await cta.boundingBox();

    const isCtaInViewport = ctaBox && (ctaBox.y + ctaBox.height <= vp.height);

    console.log(`  Canvas dimensions: ${canvasBox?.width.toFixed(1)}px x ${canvasBox?.height.toFixed(1)}px`);
    console.log(`  Horizontal overflow: ${hasHorizontalOverflow ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  CTA top offset: ${ctaBox?.y.toFixed(1)}px (In viewport: ${isCtaInViewport})`);

    // Capture screenshot
    const screenshotPath = `hero-${vp.name}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`  Captured screenshot: ${screenshotPath}`);

    // If 1920x1080, simulate cursor moving over canvas
    if (vp.width === 1920 && canvasBox) {
      console.log('  Simulating mouse interaction on canvas at 1920x1080...');
      for (let i = 0; i <= 10; i++) {
        const x = canvasBox.x + (canvasBox.width / 10) * i;
        const y = canvasBox.y + canvasBox.height / 2;
        await page.mouse.move(x, y);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(500);
      await page.screenshot({ path: `hero-${vp.name}-interacted.png` });
      console.log(`  Captured interacted screenshot: hero-${vp.name}-interacted.png`);
    }

    results.push({
      viewport: vp.name,
      noOverflow: !hasHorizontalOverflow,
      canvasWidth: canvasBox?.width,
      canvasHeight: canvasBox?.height,
      ctaVisibleInViewport: isCtaInViewport
    });

    await page.close();
  }

  await browser.close();

  console.log('\n==========================================');
  console.log('VIEWPORT TEST SUMMARY:');
  for (const r of results) {
    console.log(`  ${r.viewport}: Overflow: ${r.noOverflow ? 'PASS' : 'FAIL'}, Canvas: ${r.canvasWidth?.toFixed(0)}x${r.canvasHeight?.toFixed(0)}, CTA in Viewport: ${r.ctaVisibleInViewport}`);
  }
  console.log('==========================================');
}

testHeroViewports().catch(console.error);
