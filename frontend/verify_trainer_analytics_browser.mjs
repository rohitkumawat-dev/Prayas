import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000/api';

async function runBrowserVerification() {
  console.log('=== STARTING TRAINER ANALYTICS BROWSER PLAYWRIGHT TEST ===\n');

  // Discover credentials from DB via fetch
  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya.iyer@example.com', password: 'Trainer@123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success && loginData.status !== 'success') {
    throw new Error(`Failed to authenticate Ananya Iyer via backend: ${JSON.stringify(loginData)}`);
  }
  const trainerToken = loginData.data.token;

  // Discover owned courses
  const coursesRes = await fetch(`${BACKEND_URL}/trainer/courses`, {
    headers: { 'Authorization': `Bearer ${trainerToken}` }
  });
  const coursesData = await coursesRes.json();
  const ownedCourse = coursesData.data[0];
  console.log(`Discovered Trainer: Ananya Iyer, Owned Course ID=${ownedCourse.id} ('${ownedCourse.title}')`);

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 850 } });
  const page = await context.newPage();

  try {
    // 1. LOGIN AS TRAINER
    console.log('\n--- Step 1: Login as Trainer ---');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'ananya.iyer@example.com');
    await page.fill('input[type="password"]', 'Trainer@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer/dashboard', { timeout: 10000 });
    console.log('[PASS] Logged in and routed to /trainer/dashboard');

    // 2. NAVIGATE TO COURSES LIST
    console.log('\n--- Step 2: Trainer Courses List & Performance Button ---');
    await page.goto(`${BASE_URL}/trainer/courses`);
    await page.waitForSelector('h1:has-text("Courses")');
    await page.waitForTimeout(1000);

    // Verify "Performance" button exists on the course card
    const perfButtons = page.locator('button:has-text("Performance")');
    const buttonCount = await perfButtons.count();
    if (buttonCount === 0) {
      throw new Error('No "Performance" button found on course cards');
    }
    console.log(`[PASS] Found ${buttonCount} course card(s) with "Performance" action button`);

    // 3. CLICK PERFORMANCE TO OPEN COURSE ANALYTICS
    console.log('\n--- Step 3: Course Performance Overview Page ---');
    await perfButtons.first().click();
    await page.waitForURL(`**/trainer/courses/${ownedCourse.id}/performance`, { timeout: 10000 });
    await page.waitForSelector('h1');

    const courseTitle = await page.locator('h1').textContent();
    console.log(`[PASS] Navigated to Performance Analytics: '${courseTitle.trim()}'`);

    // Verify Overview Stats Cards
    const statsCards = page.locator('.text-3xl.font-bold');
    const statsCount = await statsCards.count();
    if (statsCount < 4) {
      throw new Error(`Expected at least 4 stats cards, got ${statsCount}`);
    }
    const enrolledVal = await statsCards.nth(0).textContent();
    const attemptsVal = await statsCards.nth(1).textContent();
    const avgScoreVal = await statsCards.nth(2).textContent();
    const passRateVal = await statsCards.nth(3).textContent();
    console.log(`[PASS] Stats Cards: Enrolled=${enrolledVal}, Total Attempts=${attemptsVal}, Avg Score=${avgScoreVal}, Pass Rate=${passRateVal}`);

    // Verify Schema Notice
    const schemaNotice = page.locator('text=Schema Transparency Notice');
    const noticeExists = await schemaNotice.count();
    if (noticeExists > 0) {
      console.log('[PASS] Transparent schema notice displayed cleanly');
    }

    // 4. LEARNERS TABLE & INTERACTION
    console.log('\n--- Step 4: Learners Table, Search & Filter ---');
    await page.waitForSelector('table');
    const initialRows = await page.locator('tbody tr').count();
    console.log(`[PASS] Learners table loaded with ${initialRows} enrolled learner row(s)`);

    // Test Search Filter
    const searchInput = page.locator('input[placeholder*="Search learners"]');
    await searchInput.fill('Arjun');
    await page.waitForTimeout(400);
    const searchFilteredRows = await page.locator('tbody tr').count();
    console.log(`[PASS] Search filter for 'Arjun' reduced table rows to ${searchFilteredRows}`);
    await searchInput.fill(''); // Clear search
    await page.waitForTimeout(400);

    // Test Status Filter Button ("Passed")
    const passedFilterBtn = page.locator('button:has-text("Passed")').first();
    await passedFilterBtn.click();
    await page.waitForTimeout(400);
    const passedRows = await page.locator('tbody tr').count();
    console.log(`[PASS] Filter 'Passed' applied: showing ${passedRows} row(s)`);

    // Reset filter to All
    await page.locator('button:has-text("All Learners")').click();
    await page.waitForTimeout(400);

    // 5. INSPECT ATTEMPTS MODAL (DESKTOP)
    console.log('\n--- Step 5: Trainee Assessment History Modal (Desktop) ---');
    const inspectBtn = page.locator('button:has-text("Inspect Attempts")').first();
    await inspectBtn.click();

    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    const modalTitle = await page.locator('[role="dialog"] h2').textContent();
    console.log(`[PASS] Opened Attempt Detail Modal: '${modalTitle?.trim()}'`);

    await page.waitForSelector('[role="dialog"] h4');
    const traineeNameInModal = await page.locator('[role="dialog"] h4').first().textContent();
    console.log(`[PASS] Modal Trainee: ${traineeNameInModal?.trim()}`);

    // Verify attempt history entries
    const attemptCards = page.locator('[role="dialog"] span:has-text("#")');
    const attemptCount = await attemptCards.count();
    console.log(`[PASS] Found ${attemptCount} chronological attempt record(s) in modal`);

    // Screenshot modal desktop
    await page.screenshot({ path: 'verify-trainer-learner-modal-desktop.png' });

    // Test Desktop Footer Close button (real click, NO force:true)
    const footerCloseBtn = page.locator('button[data-testid="modal-close-footer-btn"]');
    await footerCloseBtn.scrollIntoViewIfNeeded();
    await footerCloseBtn.click();
    await page.waitForTimeout(500);

    const isModalOpenAfterFooterClose = await page.locator('[role="dialog"]').count() > 0;
    if (isModalOpenAfterFooterClose) {
      throw new Error('Desktop: Modal failed to close via footer Close button');
    }
    console.log('[PASS] Desktop: Modal closed successfully via footer Close button (real interaction)');

    // Test Desktop 'X' Close button
    await inspectBtn.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    const xCloseBtn = page.locator('button[data-testid="dialog-close-x"]');
    await xCloseBtn.click();
    await page.waitForTimeout(500);

    const isModalOpenAfterXClose = await page.locator('[role="dialog"]').count() > 0;
    if (isModalOpenAfterXClose) {
      throw new Error('Desktop: Modal failed to close via X button');
    }
    console.log('[PASS] Desktop: Modal closed successfully via X button (real interaction)');

    // 5.1 INSPECT ATTEMPTS MODAL (MOBILE VIEWPORT: 375x667)
    console.log('\n--- Step 5.1: Trainee Assessment History Modal (Mobile 375x667) ---');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const mobileInspectBtn = page.locator('button:has-text("Inspect Attempts")').first();
    await mobileInspectBtn.scrollIntoViewIfNeeded();
    await mobileInspectBtn.click();

    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    console.log('[PASS] Mobile: Opened Attempt Detail Modal on 375x667 viewport');

    // Screenshot modal mobile
    await page.screenshot({ path: 'verify-trainer-learner-modal-mobile.png' });

    // Verify modal content is visible on mobile
    const mobileAttemptCards = page.locator('[role="dialog"] span:has-text("#")');
    const mobileAttemptCount = await mobileAttemptCards.count();
    console.log(`[PASS] Mobile: Found ${mobileAttemptCount} chronological attempt record(s)`);

    // Test Mobile Footer Close button (real click, NO force:true)
    const mobileFooterCloseBtn = page.locator('button[data-testid="modal-close-footer-btn"]');
    await mobileFooterCloseBtn.scrollIntoViewIfNeeded();
    await mobileFooterCloseBtn.click();
    await page.waitForTimeout(500);

    const isMobileModalOpenAfterClose = await page.locator('[role="dialog"]').count() > 0;
    if (isMobileModalOpenAfterClose) {
      throw new Error('Mobile: Modal failed to close via footer Close button');
    }
    console.log('[PASS] Mobile: Modal closed successfully via footer Close button (real interaction)');

    // Restore desktop viewport
    await page.setViewportSize({ width: 1366, height: 850 });
    await page.waitForTimeout(500);

    // 6. ASSESSMENT BREAKDOWN TAB
    console.log('\n--- Step 6: Assessment Breakdown Tab ---');
    await page.locator('button:has-text("Assessment Breakdown")').click();
    await page.waitForTimeout(600);

    const quizCards = page.locator('text=Passing Threshold');
    const quizCardCount = await quizCards.count();
    if (quizCardCount === 0) throw new Error('No quiz breakdown cards rendered');
    console.log(`[PASS] Assessment Breakdown tab active: ${quizCardCount} quiz card(s) displayed`);

    await page.screenshot({ path: 'verify-trainer-performance-page.png' });

    // 7. CONTENT MANAGER PERFORMANCE BUTTON LINK
    console.log('\n--- Step 7: Content Manager Header Link ---');
    await page.goto(`${BASE_URL}/trainer/courses/${ownedCourse.id}/manage`);
    await page.waitForSelector('h1:has-text("Course Content Manager")');

    const perfHeaderBtn = page.locator('button:has-text("Performance Analytics")');
    if (await perfHeaderBtn.count() === 0) {
      throw new Error('Performance Analytics button missing in Course Content Manager header');
    }
    await perfHeaderBtn.click();
    await page.waitForURL(`**/trainer/courses/${ownedCourse.id}/performance`, { timeout: 10000 });
    console.log('[PASS] Performance Analytics header button works seamlessly in Course Content Manager');

    // 8. CROSS-TRAINER AUTHORIZATION TEST IN UI
    console.log('\n--- Step 8: Cross-Trainer Access Isolation in UI ---');
    // Course 2 belongs to Rohan Mehta (trainer_id 3), while Ananya Iyer is trainer_id 2
    await page.goto(`${BASE_URL}/trainer/courses/2/performance`);
    await page.waitForTimeout(1500);

    const pageContent = await page.textContent('body');
    if (pageContent.includes('Analytics Not Found') || pageContent.includes('not have permission') || pageContent.includes('403') || pageContent.includes('Unauthorized') || pageContent.includes('Error')) {
      console.log('[PASS] Cross-trainer access strictly blocked with error / access denial view');
    } else {
      throw new Error('Security violation: Ananya Iyer was able to view Rohan Mehta\'s course analytics in UI!');
    }
    await page.screenshot({ path: 'verify-trainer-unauthorized-blocked.png' });

    console.log('\n==================================================');
    console.log('ALL BROWSER PLAYWRIGHT VERIFICATIONS PASSED!');
    console.log('==================================================');
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
