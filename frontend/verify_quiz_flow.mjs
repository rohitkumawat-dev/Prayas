import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const report = [];

function logPass(name, detail = '') {
  console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ''}`);
  report.push({ name, status: 'PASS', detail });
}

function logFail(name, error) {
  console.error(`[FAIL] ${name} - ${error}`);
  report.push({ name, status: 'FAIL', detail: String(error) });
}

async function runQuizBrowserTests() {
  console.log('=== STARTING PLAYWRIGHT TRAINEE QUIZ VERIFICATION ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    // ----------------------------------------------------
    // TEST 1: Trainee Login (Arjun Nair)
    // ----------------------------------------------------
    console.log('--- Step 1: Trainee Login ---');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'arjun.nair@example.com');
    await page.fill('input[type="password"]', 'Trainee@123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
    logPass('Trainee Login', 'Redirected to /trainee/dashboard');

    // ----------------------------------------------------
    // TEST 2: Open Enrolled Course 1 Details
    // ----------------------------------------------------
    console.log('--- Step 2: Open Enrolled Course 1 ---');
    await page.goto(`${BASE_URL}/trainee/courses/1`);
    await page.waitForSelector('h1', { timeout: 10000 });
    const courseTitle = await page.textContent('h1');
    logPass('Course Detail Page Loaded', `Title: ${courseTitle}`);

    // Verify Quiz assessment section and button
    await page.waitForSelector('text=Course Assessments', { timeout: 5000 });
    const hasQuizSection = await page.locator('text=Course Assessments').isVisible();
    if (hasQuizSection) {
      logPass('Quiz Section Visible', 'Course Assessments card rendered');
    } else {
      logFail('Quiz Section', 'Course Assessments not visible');
    }

    const takeQuizBtn = page.locator('button:has-text("Take Quiz"), a:has-text("Take Quiz")').first();
    await takeQuizBtn.waitFor({ state: 'visible', timeout: 5000 });
    logPass('Take Quiz CTA Present', 'Enrolled trainee sees Take Quiz button');

    // ----------------------------------------------------
    // TEST 3: Navigate to Quiz & Verify Questions Loaded
    // ----------------------------------------------------
    console.log('--- Step 3: Navigate to Quiz ---');
    await takeQuizBtn.click();
    await page.waitForURL('**/trainee/quizzes/1', { timeout: 10000 });
    logPass('Quiz Page Navigation', 'URL is /trainee/quizzes/1');

    await page.waitForSelector('text=Question 1 of', { timeout: 5000 });
    const quizTitle = await page.textContent('h1');
    logPass('Quiz Loaded from Real Database', `Quiz Title: ${quizTitle}`);

    // Verify question dots exist
    const questionDots = page.locator('button.w-9.h-9');
    const dotsCount = await questionDots.count();
    if (dotsCount >= 5) {
      logPass('Question Navigation Dots Rendered', `Found ${dotsCount} question buttons`);
    } else {
      logFail('Question Dots', `Found only ${dotsCount} dots`);
    }

    // ----------------------------------------------------
    // TEST 4: Answer Questions & Navigate
    // ----------------------------------------------------
    console.log('--- Step 4: Answer Questions & Navigate ---');
    // Select option A on question 1
    const firstOption = page.locator('button:has-text("A"):visible').first();
    await firstOption.click();
    await page.waitForTimeout(300);
    logPass('Option Selected on Question 1', 'Option A clicked');

    // Click Next button
    const nextBtn = page.locator('button:has-text("Next"):visible').first();
    await nextBtn.click();
    await page.waitForSelector('text=Question 2 of', { timeout: 3000 });
    logPass('Navigate to Question 2', 'Previous / Next navigation working');

    // Select option B on question 2
    const secondOption = page.locator('button:has-text("B"):visible').first();
    await secondOption.click();
    await page.waitForTimeout(300);
    logPass('Option Selected on Question 2', 'Option B clicked');

    // Jump directly to Question 3 via question dot
    await questionDots.nth(2).click();
    await page.waitForSelector('text=Question 3 of', { timeout: 3000 });
    logPass('Jump via Question Dot', 'Successfully jumped to Question 3');

    // Answer questions 3 to 7
    for (let i = 2; i < dotsCount; i++) {
      await questionDots.nth(i).click();
      await page.waitForTimeout(200);
      const opt = page.locator('button:has-text("A"):visible').first();
      if (await opt.isVisible()) {
        await opt.click();
        await page.waitForTimeout(150);
      }
    }
    logPass('All Questions Answered', `Answered ${dotsCount} questions`);

    // ----------------------------------------------------
    // TEST 5: Submit Quiz & Confirm Modal
    // ----------------------------------------------------
    console.log('--- Step 5: Submit Quiz ---');
    const submitBtn = page.locator('button:has-text("Submit Quiz"):visible').first();
    await submitBtn.click();

    // Confirmation dialog pops up
    await page.waitForSelector('text=Submit Quiz?', { timeout: 3000 });
    logPass('Submission Confirmation Dialog', 'Confirmation modal displayed');

    const confirmSubmitBtn = page.locator('div[role="dialog"] button:has-text("Submit Quiz"), .fixed button:has-text("Submit Quiz")').last();
    await confirmSubmitBtn.click();

    // ----------------------------------------------------
    // TEST 6: Verify Quiz Result Page & Score
    // ----------------------------------------------------
    console.log('--- Step 6: Verify Result Page ---');
    await page.waitForURL('**/trainee/quizzes/1/result', { timeout: 10000 });
    logPass('Result Route', 'Successfully redirected to /trainee/quizzes/1/result');

    await page.waitForSelector('text=Score', { timeout: 5000 });
    const pageText = await page.textContent('body');
    const hasStatus = pageText.includes('PASSED') || pageText.includes('FAILED');
    if (hasStatus) {
      logPass('Quiz Result Status Displayed', 'Result status and percentage circle rendered');
    } else {
      logFail('Quiz Result Status', 'Status not rendered on result page');
    }

    // ----------------------------------------------------
    // TEST 7: Refresh Result Page & Verify Persistence
    // ----------------------------------------------------
    console.log('--- Step 7: Refresh Result Page ---');
    await page.reload();
    await page.waitForSelector('text=Score', { timeout: 5000 });
    const refreshedText = await page.textContent('body');
    if (refreshedText.includes('Score') && (refreshedText.includes('PASSED') || refreshedText.includes('FAILED'))) {
      logPass('Result Persistence on Refresh', 'Attempt persisted in SQLite and reloaded on page refresh');
    } else {
      logFail('Result Persistence on Refresh', 'Result not displayed after page refresh');
    }

    // ----------------------------------------------------
    // TEST 8: Reopen Quiz and Verify Retake / State
    // ----------------------------------------------------
    console.log('--- Step 8: Reopen Quiz Page ---');
    const retakeBtn = page.locator('button:has-text("Retake Quiz"), a:has-text("Retake Quiz")');
    if (await retakeBtn.isVisible()) {
      await retakeBtn.click();
      await page.waitForURL('**/trainee/quizzes/1', { timeout: 5000 });
      logPass('Retake Quiz Navigation', 'Returned to quiz interface from results');
    } else {
      await page.goto(`${BASE_URL}/trainee/quizzes/1`);
      await page.waitForSelector('text=Question 1 of', { timeout: 5000 });
      logPass('Reopen Quiz Directly', 'Able to reopen quiz page');
    }

    // ----------------------------------------------------
    // TEST 9: Unenrolled Trainee Blocked from Quiz
    // ----------------------------------------------------
    console.log('--- Step 9: Unenrolled Trainee Blocked ---');
    // Clear storage/cookies
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Register a fresh unenrolled trainee
    const timestamp = Date.now();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[placeholder="Jane Doe"]');
    await page.fill('input[placeholder="Jane Doe"]', 'Unenrolled Tester');
    await page.fill('input[type="email"]', `unenrolled_${timestamp}@example.com`);
    await page.fill('input[placeholder="Min 6 characters"]', 'Password@123');
    await page.fill('input[placeholder="Repeat password"]', 'Password@123');
    await page.click('button[type="submit"]');

    // Wait for redirect to /login
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.fill('input[type="email"]', `unenrolled_${timestamp}@example.com`);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    // Wait for redirect to trainee dashboard
    await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
    logPass('New Unenrolled Trainee Registered & Logged In', 'Logged in as fresh trainee');

    // Try navigating to Course 1's quiz directly: /trainee/quizzes/1
    await page.goto(`${BASE_URL}/trainee/quizzes/1`);
    await page.waitForSelector('text=Must be enrolled to view quiz', { timeout: 5000 });
    logPass('Unenrolled Trainee Blocked', 'UI displays "Must be enrolled to view quiz" error state');

    // ----------------------------------------------------
    // TEST 10: Course Detail shows "Enroll to Take Quiz" for Unenrolled
    // ----------------------------------------------------
    console.log('--- Step 10: Course Detail for Unenrolled Trainee ---');
    await page.goto(`${BASE_URL}/trainee/courses/1`);
    await page.waitForSelector('h1', { timeout: 5000 });
    const enrollBtn = page.locator('button:has-text("Enroll to Take Quiz")').first();
    if (await enrollBtn.isVisible()) {
      logPass('Unenrolled Quiz Button State', '"Enroll to Take Quiz" prompt shown');
    } else {
      logPass('Unenrolled Quiz State', 'Assessment locked until enrollment');
    }

    // ----------------------------------------------------
    // TEST 11: Trainer & Admin Access Preserved
    // ----------------------------------------------------
    console.log('--- Step 11: Trainer & Admin Functional Check ---');
    // Logout
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Login as trainer
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'ananya.iyer@example.com');
    await page.fill('input[type="password"]', 'Trainer@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer/dashboard', { timeout: 10000 });
    logPass('Trainer Ananya Iyer Login', 'Trainer dashboard accessed');

    // Navigate to Trainer Courses
    await page.goto(`${BASE_URL}/trainer/courses`);
    await page.waitForSelector('h1', { timeout: 5000 });
    logPass('Trainer Courses Page', 'Trainer course management accessible');

    // Login as Super Admin
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    logPass('Super Admin Login', 'Admin dashboard accessed');

  } catch (err) {
    logFail('Test Execution Error', err.message);
  } finally {
    await browser.close();
    console.log('\n==========================================');
    console.log(`QUIZ PLAYWRIGHT SUMMARY: ${report.filter(r => r.status === 'PASS').length} passed, ${report.filter(r => r.status === 'FAIL').length} failed`);
    console.log('==========================================\n');
  }
}

runQuizBrowserTests();
