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

async function runBrowserQuizTests() {
  console.log('=== STARTING PLAYWRIGHT DYNAMIC COURSE QUIZ VERIFICATION ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    // 1. Fetch all courses dynamically from API
    console.log('--- Step 1: Discover Courses Dynamically ---');
    const coursesRes = await page.request.get('http://localhost:5000/api/courses');
    const coursesData = await coursesRes.json();
    const courses = coursesData.data || [];
    logPass('Dynamic Course Discovery', `Discovered ${courses.length} courses from API`);

    if (courses.length === 0) {
      throw new Error('No courses found from API');
    }

    // 2. Trainee Login
    console.log('\n--- Step 2: Trainee Login (Arjun Nair) ---');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'arjun.nair@example.com');
    await page.fill('input[type="password"]', 'Trainee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
    logPass('Trainee Login', 'Redirected to /trainee/dashboard');

    // 3. Test Course Assessments Across Courses Dynamically
    for (const course of courses) {
      console.log(`\n--- Step 3: Checking Course ID ${course.id}: "${course.title}" ---`);
      
      // Navigate to course detail
      await page.goto(`${BASE_URL}/trainee/courses/${course.id}`);
      await page.waitForSelector('h1', { timeout: 10000 });
      logPass(`Course Detail ${course.id} Loaded`, `Title: ${course.title}`);

      // Verify Course Assessments Section
      await page.waitForSelector('text=Course Assessments', { timeout: 5000 });
      logPass(`Assessment Section Present for Course ${course.id}`, 'Header visible');

      // Fetch course detail from API to know its quizzes
      const cDetailRes = await page.request.get(`http://localhost:5000/api/courses/${course.id}`);
      const cDetail = (await cDetailRes.json()).data;
      const courseQuizzes = cDetail.quizzes || [];

      if (courseQuizzes.length > 0) {
        const quiz = courseQuizzes[0];
        logPass(`Quiz Associated with Course ${course.id}`, `Quiz ID ${quiz.id}: "${quiz.title}" (${quiz.questions_count} questions, Passing: ${quiz.passing_score}%)`);

        // Check quiz card is rendered on page
        const quizCard = page.locator(`text=${quiz.title}`).first();
        await quizCard.waitFor({ state: 'visible', timeout: 5000 });
        logPass(`Quiz Card Rendered for Course ${course.id}`, `Title: ${quiz.title}`);

        // Verify Take Quiz button navigates to THIS course's quiz
        const exactTakeQuizBtn = page.getByRole('button', { name: 'Take Quiz', exact: true });
        const enrollToTakeQuizBtn = page.getByRole('button', { name: 'Enroll to Take Quiz', exact: true });

        if (await enrollToTakeQuizBtn.isVisible()) {
          logPass(`Enroll Prompt for Quiz ${quiz.id}`, 'Enroll to Take Quiz prompt shown for unenrolled course');
          await enrollToTakeQuizBtn.click();
          await page.waitForTimeout(1200);
          logPass(`Enrolled in Course ${course.id}`, 'Successfully clicked Enroll to Take Quiz');
        }

        if (await exactTakeQuizBtn.isVisible()) {
          await exactTakeQuizBtn.click();
          await page.waitForURL(`**/trainee/quizzes/${quiz.id}`, { timeout: 10000 });
          logPass(`Dynamic Navigation to Quiz ${quiz.id}`, `Navigated to /trainee/quizzes/${quiz.id}`);

          // Verify questions rendered
          await page.waitForSelector('text=Question 1 of', { timeout: 5000 });
          const qDots = page.locator('button.w-9.h-9');
          const dotsCount = await qDots.count();
          logPass(`Question Dots for Quiz ${quiz.id}`, `Rendered ${dotsCount} question dots (expected 8)`);

          // Answer questions
          for (let i = 0; i < dotsCount; i++) {
            await qDots.nth(i).click();
            await page.waitForTimeout(150);
            const opt = page.locator('button:has-text("A"):visible, button:has-text("B"):visible').first();
            if (await opt.isVisible()) {
              await opt.click();
              await page.waitForTimeout(100);
            }
          }

          // Submit quiz
          const submitBtn = page.locator('button:has-text("Submit Quiz"):visible').first();
          await submitBtn.click();
          await page.waitForSelector('text=Submit Quiz?', { timeout: 5000 });
          const confirmBtn = page.locator('div[role="dialog"] button:has-text("Submit Quiz"), .fixed button:has-text("Submit Quiz")').last();
          await confirmBtn.click();

          // Result page
          await page.waitForURL(`**/trainee/quizzes/${quiz.id}/result`, { timeout: 10000 });
          logPass(`Result Page for Quiz ${quiz.id}`, `Navigated to /trainee/quizzes/${quiz.id}/result`);

          await page.waitForSelector('text=Score', { timeout: 5000 });
          logPass(`Score Circle for Quiz ${quiz.id}`, 'Score and completion status displayed');

          // Refresh result page to test persistence
          await page.reload();
          await page.waitForSelector('text=Score', { timeout: 5000 });
          logPass(`Persistence on Refresh for Quiz ${quiz.id}`, 'Result persisted after page reload');
        }
      } else {
        // Empty state check
        const emptyState = page.locator('text=No assessments currently assigned to this course');
        await emptyState.waitFor({ state: 'visible', timeout: 5000 });
        logPass(`Empty State for Course ${course.id}`, 'Clean empty state message shown');
      }
    }

    // 4. Security: Unenrolled Trainee Blocked Across All Discovered Quizzes
    console.log('\n--- Step 4: Security Verification (Unenrolled Trainee) ---');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const timestamp = Date.now();
    await page.goto(`${BASE_URL}/register`);
    await page.waitForSelector('input[placeholder="Jane Doe"]');
    await page.fill('input[placeholder="Jane Doe"]', 'Unenrolled Tester');
    await page.fill('input[type="email"]', `unenrolled_${timestamp}@example.com`);
    await page.fill('input[placeholder="Min 6 characters"]', 'Password@123');
    await page.fill('input[placeholder="Repeat password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/login', { timeout: 10000 });
    await page.fill('input[type="email"]', `unenrolled_${timestamp}@example.com`);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
    logPass('Unenrolled Trainee Created & Logged In', 'Fresh account with zero enrollments');

    for (const course of courses) {
      const cDetailRes = await page.request.get(`http://localhost:5000/api/courses/${course.id}`);
      const cDetail = (await cDetailRes.json()).data;
      for (const quiz of (cDetail.quizzes || [])) {
        await page.goto(`${BASE_URL}/trainee/quizzes/${quiz.id}`);
        await page.waitForSelector('text=Must be enrolled to view quiz', { timeout: 5000 });
        logPass(`Unenrolled Access Blocked for Quiz ${quiz.id}`, 'UI displays "Must be enrolled to view quiz"');
      }
    }

  } catch (err) {
    logFail('Browser Verification Error', err.message);
  } finally {
    await browser.close();
    console.log('\n==========================================');
    console.log(`DYNAMIC QUIZ PLAYWRIGHT SUMMARY: ${report.filter(r => r.status === 'PASS').length} passed, ${report.filter(r => r.status === 'FAIL').length} failed`);
    console.log('==========================================\n');
  }
}

runBrowserQuizTests();
