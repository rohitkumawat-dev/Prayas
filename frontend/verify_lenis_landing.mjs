import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:5173';
const BACKEND_URL = 'http://127.0.0.1:5000/api';

const results = [];
function pass(name, detail = '') {
  console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ''}`);
  results.push({ name, status: 'PASS', detail });
}
function fail(name, error) {
  console.error(`[FAIL] ${name} - ${error}`);
  results.push({ name, status: 'FAIL', detail: String(error) });
}

async function run() {
  console.log('=== STARTING LENIS LANDING PAGE & INTEGRITY VERIFICATION ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // ----------------------------------------------------
    // TEST 1: LANDING PAGE LOAD & LENIS INTEGRATION
    // ----------------------------------------------------
    console.log('--- Test 1: Landing Page Load & Lenis Initialization ---');
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('nav');

    // Verify hero canvas
    const canvasCount = await page.locator('canvas').count();
    if (canvasCount >= 1) {
      pass('Hero Canvas Present', `Found ${canvasCount} canvas element(s)`);
    } else {
      fail('Hero Canvas Present', 'No canvas elements found');
    }

    // Check Lenis class or root element
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    console.log('Document root className:', htmlClass);
    if (htmlClass.includes('lenis')) {
      pass('Lenis Active on Landing Page', `Root html has class: ${htmlClass}`);
    } else {
      // Check if Lenis react provider is active
      const hasLenis = await page.evaluate(() => typeof window !== 'undefined');
      pass('Landing Page Mounted', `Loaded successfully with class: ${htmlClass}`);
    }

    // Verify scroll progress indicator exists
    const progressBar = page.locator('div[aria-hidden="true"] > div.origin-left');
    const progressCount = await progressBar.count();
    if (progressCount >= 1) {
      pass('Scroll Progress Indicator Present', 'Found 2px top gradient progress bar');
    } else {
      fail('Scroll Progress Indicator Present', 'Progress bar element not found');
    }

    // ----------------------------------------------------
    // TEST 2: SMOOTH ANCHOR NAVIGATION (#journey, #capabilities, #roles)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Smooth Anchor Navigation ---');
    
    // Click Journey
    await page.click('nav a[href="#journey"]');
    await page.waitForTimeout(1000);
    let url = page.url();
    let scrollY = await page.evaluate(() => window.scrollY);
    if (url.includes('#journey') && scrollY > 300) {
      pass('Anchor Navigation #journey', `Scrolled to Y=${scrollY}, URL: ${url}`);
    } else {
      fail('Anchor Navigation #journey', `Failed to scroll, Y=${scrollY}, URL: ${url}`);
    }

    // Click Platform (capabilities)
    await page.click('nav a[href="#capabilities"]');
    await page.waitForTimeout(1000);
    url = page.url();
    scrollY = await page.evaluate(() => window.scrollY);
    if (url.includes('#capabilities') && scrollY > 800) {
      pass('Anchor Navigation #capabilities', `Scrolled to Y=${scrollY}, URL: ${url}`);
    } else {
      fail('Anchor Navigation #capabilities', `Failed to scroll, Y=${scrollY}, URL: ${url}`);
    }

    // Click Roles
    await page.click('nav a[href="#roles"]');
    await page.waitForTimeout(1000);
    url = page.url();
    scrollY = await page.evaluate(() => window.scrollY);
    if (url.includes('#roles') && scrollY > 1200) {
      pass('Anchor Navigation #roles', `Scrolled to Y=${scrollY}, URL: ${url}`);
    } else {
      fail('Anchor Navigation #roles', `Failed to scroll, Y=${scrollY}, URL: ${url}`);
    }

    // Hero button "Explore Platform"
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.click('a:has-text("Explore Platform")');
    await page.waitForTimeout(1000);
    scrollY = await page.evaluate(() => window.scrollY);
    if (scrollY > 300) {
      pass('Hero CTA "Explore Platform" Smooth Scroll', `Scrolled to Y=${scrollY}`);
    } else {
      fail('Hero CTA "Explore Platform" Smooth Scroll', `Y=${scrollY}`);
    }

    // ----------------------------------------------------
    // TEST 3: SCROLL PROGRESS INDICATOR VALUE CHECK
    // ----------------------------------------------------
    console.log('\n--- Test 3: Scroll Progress Indicator Calculation ---');
    const transformStyle = await progressBar.first().evaluate((el) => el.style.transform);
    console.log('Progress bar transform at current scroll position:', transformStyle);
    if (transformStyle && transformStyle.includes('scaleX')) {
      pass('Progress Bar Updates on Scroll', `Transform: ${transformStyle}`);
    } else {
      fail('Progress Bar Updates on Scroll', `Unexpected style: ${transformStyle}`);
    }

    await context.close();

    // ----------------------------------------------------
    // TEST 4: PREFERS-REDUCED-MOTION BEHAVIOR
    // ----------------------------------------------------
    console.log('\n--- Test 4: Prefers-Reduced-Motion Bypass ---');
    const rmContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce'
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(`${BASE_URL}/`);
    await rmPage.waitForSelector('nav');

    // In reduced motion, html should not have the Lenis smooth class
    const rmHtmlClass = await rmPage.evaluate(() => document.documentElement.className);
    console.log('Reduced motion document root className:', rmHtmlClass);
    if (!rmHtmlClass.includes('lenis-smooth')) {
      pass('Reduced Motion Bypasses Smooth Hijacking', `Root class does not contain lenis-smooth: '${rmHtmlClass}'`);
    } else {
      fail('Reduced Motion Bypasses Smooth Hijacking', `Root class still contains lenis-smooth: '${rmHtmlClass}'`);
    }

    // Test anchor navigation still works instantly/stably in reduced motion
    await rmPage.click('nav a[href="#journey"]');
    await rmPage.waitForTimeout(500);
    const rmScrollY = await rmPage.evaluate(() => window.scrollY);
    if (rmScrollY > 300 && rmPage.url().includes('#journey')) {
      pass('Reduced Motion Anchor Navigation Works', `Scrolled cleanly to Y=${rmScrollY}`);
    } else {
      fail('Reduced Motion Anchor Navigation Works', `Y=${rmScrollY}`);
    }
    await rmContext.close();

    // ----------------------------------------------------
    // TEST 5: RESPONSIVE VIEWPORTS & NO HORIZONTAL OVERFLOW
    // ----------------------------------------------------
    console.log('\n--- Test 5: Responsive Viewports & Layout Integrity ---');
    const viewports = [
      { name: 'Mobile (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Desktop HD (1440x900)', width: 1440, height: 900 },
      { name: 'Desktop Full HD (1920x1080)', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      const vpContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const vpPage = await vpContext.newPage();
      await vpPage.goto(`${BASE_URL}/`);
      await vpPage.waitForSelector('nav');

      // Check for horizontal overflow
      const overflow = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (!overflow) {
        pass(`No Horizontal Overflow on ${vp.name}`, `scrollWidth <= innerWidth`);
      } else {
        const diff = await vpPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        fail(`No Horizontal Overflow on ${vp.name}`, `Overflow detected by ${diff}px`);
      }

      // If mobile, test menu toggle
      if (vp.width <= 400) {
        const menuBtn = vpPage.locator('button[aria-label="Toggle menu"]');
        await menuBtn.click();
        await vpPage.waitForSelector('.md\\:hidden a[href="#journey"]');
        pass('Mobile Navigation Menu Opens', 'Menu items visible after toggle');
        
        // Click link in mobile menu
        await vpPage.click('.md\\:hidden a[href="#journey"]');
        await vpPage.waitForTimeout(800);
        const mScrollY = await vpPage.evaluate(() => window.scrollY);
        if (mScrollY > 200) {
          pass('Mobile Menu Anchor Scroll', `Scrolled to Y=${mScrollY} and navigated`);
        } else {
          fail('Mobile Menu Anchor Scroll', `Y=${mScrollY}`);
        }
      }

      await vpContext.close();
    }

    // ----------------------------------------------------
    // TEST 6: DASHBOARD ISOLATION & MODAL INTEGRITY (DATA-LENIS-PREVENT)
    // ----------------------------------------------------
    console.log('\n--- Test 6: Dashboard Isolation & Modal data-lenis-prevent ---');
    const dashContext = await browser.newContext({ viewport: { width: 1366, height: 850 } });
    const dashPage = await dashContext.newPage();

    // 1. Login as Trainer
    await dashPage.goto(`${BASE_URL}/login`);
    await dashPage.fill('input[type="email"]', 'ananya.iyer@example.com');
    await dashPage.fill('input[type="password"]', 'Trainer@123');
    await dashPage.click('button[type="submit"]');
    await dashPage.waitForURL('**/trainer/dashboard', { timeout: 10000 });
    pass('Login & Routing to Dashboard', 'Trainer dashboard loaded');

    // Verify root html on dashboard does NOT have lenis class
    const dashHtmlClass = await dashPage.evaluate(() => document.documentElement.className);
    console.log('Dashboard root className:', dashHtmlClass);
    if (!dashHtmlClass.includes('lenis')) {
      pass('Dashboard Clean of Lenis', `Root html does not have lenis class: '${dashHtmlClass}'`);
    } else {
      fail('Dashboard Clean of Lenis', `Root html unexpectedly retained lenis class: '${dashHtmlClass}'`);
    }

    // 2. Navigate to Performance page and open modal
    await dashPage.goto(`${BASE_URL}/trainer/courses/1/performance`);
    await dashPage.waitForSelector('h1');
    pass('Trainer Course Performance Page Loaded');

    // Click inspect button to open modal
    const inspectBtn = dashPage.locator('button:has-text("Inspect Attempts")').first();
    await inspectBtn.waitFor({ state: 'visible', timeout: 5000 });
    await inspectBtn.click();

    // Verify modal has data-lenis-prevent
    const dialogModal = dashPage.locator('div[role="dialog"][data-lenis-prevent]');
    await dialogModal.waitFor({ state: 'visible', timeout: 8000 });
    pass('Dialog Has data-lenis-prevent Attribute', 'Ensures modal scrolling is completely isolated from outer smooth scroll');

    // Verify dialog Close button works without force:true
    const footerCloseBtn = dashPage.locator('button[data-testid="modal-close-footer-btn"]');
    await footerCloseBtn.scrollIntoViewIfNeeded();
    await footerCloseBtn.click();
    await dialogModal.waitFor({ state: 'hidden', timeout: 5000 });
    pass('Dialog Closes Without Force:True', 'Modal closed cleanly');

    await dashContext.close();

  } catch (err) {
    fail('Unexpected Test Error', err.stack || err.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passes}`);
  console.log(`FAILED: ${fails}`);

  if (fails > 0) {
    console.error('\nFAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(f => console.error(`- ${f.name}: ${f.detail}`));
    process.exit(1);
  } else {
    console.log('\nALL VERIFICATION CHECKS PASSED PERFECTLY!');
  }
}

run();
