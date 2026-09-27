import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function runVerification() {
  console.log('=== STARTING CRITICAL BUGS BROWSER VERIFICATION ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let total = 0;

  function assert(cond, desc) {
    total++;
    if (cond) {
      console.log(`[PASS] Step ${total}: ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] Step ${total}: ${desc}`);
      throw new Error(`Failed: ${desc}`);
    }
  }

  const ts = Date.now();

  try {
    // ==========================================
    // FLOW A: ADMIN & SUPER ADMIN APPROVAL
    // ==========================================
    console.log('--- FLOW A: Admin & Super Admin Approval ---');

    // 1. Login as Siddharth Paradhi (Super Admin)
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    assert(page.url().includes('/admin/dashboard'), 'Super Admin successfully logged into Admin Dashboard');

    // 2. Verify Super Admin Console card is visible
    await page.waitForSelector('text=Admin Approval Requests');
    const superAdminBanner = await page.locator('text=Admin Approval Requests').first().isVisible();
    assert(superAdminBanner, 'Super Admin Approval Requests card is displayed on Dashboard');

    // 3. Navigate to User Management
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('text=User Management');
    assert(true, 'Navigated to User Management page');

    // 4. Open Create User Modal
    await page.click('button:has-text("Create User")');
    await page.waitForSelector('[role="dialog"]');
    assert(true, 'Opened Create New User modal');

    // 5. Fill and submit new Admin user
    const testAdminEmail = `browser_admin_${ts}@example.com`;
    await page.fill('[role="dialog"] input[type="text"]', 'Browser Test Admin');
    await page.fill('[role="dialog"] input[type="email"]', testAdminEmail);
    await page.fill('[role="dialog"] input[type="password"]', 'Password@123');
    await page.selectOption('[role="dialog"] select', 'admin');
    
    // Verify amber warning message appears when admin role is selected
    const requiresApprovalNotice = await page.locator('text=Requires Super Admin Approval').isVisible();
    assert(requiresApprovalNotice, 'Modal dynamically displayed "Requires Super Admin Approval" alert');

    await page.click('[role="dialog"] button:has-text("Create User")');
    await page.waitForTimeout(1000);

    // 6. Verify pending admin appears in Admin Approval Requests card
    const pendingCardVisible = await page.locator(`text=${testAdminEmail}`).first().isVisible();
    assert(pendingCardVisible, `New admin (${testAdminEmail}) visible in Super Admin Approval section`);

    // 7. Logout Super Admin
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto(`${BASE_URL}/admin/login`);

    // 8. Attempt login with pending test admin (must be blocked)
    await page.fill('input[type="email"]', testAdminEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="alert"]');
    const alertText = await page.locator('[role="alert"]').textContent();
    assert(alertText.includes('awaiting approval'), `Pending Admin login blocked with message: "${alertText}"`);

    // 9. Login again as Siddharth (Super Admin)
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    // 10. Open User Management and approve the pending admin
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('button:has-text("Approve")');
    const approveBtn = page.locator('button:has-text("Approve")').first();
    await approveBtn.click();
    await page.waitForTimeout(2000);

    // 11. Verify user status became Active in users table
    const pageText = await page.textContent('body');
    assert(pageText.includes('Active'), 'Approved Admin status transitioned to "Active" in the users table');

    // 12. Logout Super Admin
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto(`${BASE_URL}/admin/login`);

    // 13. Login as newly approved test admin (must succeed)
    await page.fill('input[type="email"]', testAdminEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    assert(page.url().includes('/admin/dashboard'), 'Approved Admin successfully logged into Admin Dashboard');

    // 14. Verify standard admin does NOT have Super Admin privileges
    const bannerAbsent = !(await page.locator('text=Admin Approval Requests').isVisible());
    assert(bannerAbsent, 'Newly approved standard admin does NOT see Admin Approval Requests banner');

    // 15. Create another admin to test rejection
    await page.goto(`${BASE_URL}/admin/users`);
    await page.click('button:has-text("Create User")');
    await page.waitForSelector('[role="dialog"]');
    const rejectAdminEmail = `browser_reject_${ts}@example.com`;
    await page.fill('[role="dialog"] input[type="text"]', 'Browser Reject Admin');
    await page.fill('[role="dialog"] input[type="email"]', rejectAdminEmail);
    await page.fill('[role="dialog"] input[type="password"]', 'Password@123');
    await page.selectOption('[role="dialog"] select', 'admin');
    await page.click('[role="dialog"] button:has-text("Create User")');
    await page.waitForTimeout(1000);

    // Standard admin does NOT see approval controls
    const approvalControlsAbsent = !(await page.locator('text=Admin Approval Requests').isVisible());
    assert(approvalControlsAbsent, 'Standard admin cannot see Admin Approval Requests card');

    // 16. Login as Super Admin to reject
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('button:has-text("Reject")');
    const rejectBtn = page.locator('button:has-text("Reject")').first();
    await rejectBtn.click();
    await page.waitForTimeout(2000);

    // 17. Verify rejected admin cannot log in
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', rejectAdminEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[role="alert"]');
    const rejectAlert = await page.locator('[role="alert"]').textContent();
    assert(rejectAlert.includes('rejected'), `Rejected admin login blocked with message: "${rejectAlert}"`);

    // 18. Verify Demo Admin (admin@capacityconnect.com) is normal admin
    await page.fill('input[type="email"]', 'admin@capacityconnect.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    const demoBannerAbsent = !(await page.locator('text=Admin Approval Requests').isVisible());
    assert(demoBannerAbsent, 'Demo Admin does NOT have Super Admin permissions');

    // ==========================================
    // FLOW B: TRAINEE ENROLLMENT & LESSON ACCESS
    // ==========================================
    console.log('\n--- FLOW B: Trainee Enrollment & Lesson Access ---');

    // 19. Register a brand new Trainee
    const traineeEmail = `trainee_browser_${ts}@example.com`;
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[placeholder="Jane Doe"]', 'Browser Trainee');
    await page.fill('input[placeholder="you@example.com"]', traineeEmail);
    await page.fill('input[placeholder="Min 6 characters"]', 'Password@123');
    await page.fill('input[placeholder="Repeat password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/login');
    assert(true, 'Trainee registered and redirected to login');

    // 20. Login as the newly registered trainee
    await page.fill('input[placeholder="you@example.com"]', traineeEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainee/dashboard');
    assert(page.url().includes('/trainee/dashboard'), 'Trainee logged in to Trainee Dashboard');

    // 21. Open Course Catalog
    await page.goto(`${BASE_URL}/trainee/courses`);
    await page.waitForSelector('text=Course Catalog');
    assert(true, 'Loaded Course Catalog');

    // 22. Open Course 6 (Advanced CSS & Animation) - User is NOT yet enrolled
    await page.goto(`${BASE_URL}/trainee/courses/6`);
    await page.waitForSelector('text=Advanced CSS & Animation');
    assert(true, 'Opened Course 6 details');

    // 23. Try to directly access Lesson 61 before enrolling (must show enrollment error)
    await page.goto(`${BASE_URL}/trainee/learning/61`);
    await page.waitForSelector('text=Failed to load lesson');
    const unenrolledErr = await page.locator('text=You must be enrolled to view this lesson').isVisible();
    assert(unenrolledErr, 'Unenrolled trainee correctly blocked with "You must be enrolled to view this lesson"');

    // 24. Return to Course 6 and click "Enroll Now"
    await page.goto(`${BASE_URL}/trainee/courses/6`);
    await page.waitForSelector('button:has-text("Enroll Now")');
    await page.click('button:has-text("Enroll Now")');
    // Button should change to "Continue Learning"
    await page.waitForSelector('button:has-text("Continue Learning")', { timeout: 8000 });
    assert(true, 'Successfully enrolled! Button transitioned to "Continue Learning"');

    // 25. Click "Continue Learning" - Must navigate to first lesson of Course 6 (Lesson 61) and load 200
    await page.click('button:has-text("Continue Learning")');
    await page.waitForURL('**/trainee/learning/61');
    assert(page.url().includes('/trainee/learning/61'), 'Continue Learning navigated to Lesson 61 (NOT course id 6)');

    // 26. Verify lesson content actually loaded without error
    await page.waitForSelector('text=CSS Grid Advanced Patterns');
    const lessonTitleVisible = await page.locator('h1:has-text("CSS Grid Advanced Patterns")').isVisible();
    assert(lessonTitleVisible, 'Lesson 61 ("CSS Grid Advanced Patterns") content rendered cleanly');

    // 27. Refresh the page and verify lesson still loads
    await page.reload();
    await page.waitForSelector('text=CSS Grid Advanced Patterns');
    const lessonAfterReload = await page.locator('h1:has-text("CSS Grid Advanced Patterns")').isVisible();
    assert(lessonAfterReload, 'Lesson still renders cleanly after page refresh');

    // 28. Navigate to another lesson in the course (Lesson 62) via next button
    await page.click('button:has-text("Next")');
    await page.waitForURL('**/trainee/learning/62');
    await page.waitForSelector('text=Flexbox vs Grid Decision Guide');
    const lesson62Visible = await page.locator('h1:has-text("Flexbox vs Grid Decision Guide")').isVisible();
    assert(lesson62Visible, 'Navigated to next lesson (Lesson 62) and content rendered cleanly');

    // 29. Verify trainee is STILL blocked from lessons in courses they are NOT enrolled in (e.g. Lesson 1 in Course 1)
    await page.goto(`${BASE_URL}/trainee/learning/1`);
    await page.waitForSelector('text=Failed to load lesson');
    const blockedLesson1 = await page.locator('text=You must be enrolled to view this lesson').isVisible();
    assert(blockedLesson1, 'Trainee remains blocked from Lesson 1 in Course 1 (not enrolled in Course 1)');

    // 30. Return to Course 6 page and test clicking individual lesson from curriculum
    await page.goto(`${BASE_URL}/trainee/courses/6`);
    await page.waitForSelector('text=Course Curriculum');
    // Click on lesson "Responsive Design Strategies" (Lesson 63)
    await page.click('text=Responsive Design Strategies');
    await page.waitForURL('**/trainee/learning/63');
    await page.waitForSelector('text=Responsive Design Strategies');
    assert(page.url().includes('/trainee/learning/63'), 'Clicking curriculum item directly navigated to Lesson 63');

    console.log('\n==========================================');
    console.log(`ALL BROWSER TESTS PASSED: ${passed}/${total}`);
    console.log('==========================================\n');

  } catch (err) {
    console.error('Browser verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
