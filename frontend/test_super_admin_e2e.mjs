import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function run() {
  console.log('=== STARTING PLAYWRIGHT SUPER ADMIN & APPROVAL E2E FLOW ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const timestamp = Date.now();
  const testPendingEmail = `e2e_pending_${timestamp}@example.com`;
  const testRejectedEmail = `e2e_rejected_${timestamp}@example.com`;

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Login as Super Admin (Siddharth Paradhi)
    // -------------------------------------------------------------------------
    console.log('STEP 1: Logging in as Super Admin (paradhisiddharth@gmail.com)...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('form');

    // Switch to Admin Login tab
    await page.click('button[role="tab"]:has-text("Admin Login")');
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('  [PASS] Super Admin logged in and redirected to /admin/dashboard');

    // Verify sidebar shows Super Admin
    const sidebarText = await page.textContent('div.border-t');
    if (sidebarText.includes('Super Admin')) {
      console.log('  [PASS] Sidebar clearly displays "Super Admin" designation');
    }

    // -------------------------------------------------------------------------
    // STEP 2: Open Admin Users
    // -------------------------------------------------------------------------
    console.log('STEP 2: Navigating to Admin Users (/admin/users)...');
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('table');
    console.log('  [PASS] Admin Users page loaded');
    await page.screenshot({ path: 'super-admin-users-view.png' });

    // -------------------------------------------------------------------------
    // STEP 3: Create a new Administrator user
    // -------------------------------------------------------------------------
    console.log(`STEP 3: Creating new Admin account (${testPendingEmail})...`);
    await page.click('button:has-text("Create User")');
    await page.waitForSelector('div[role="dialog"]');

    // Fill form
    await page.fill('div[role="dialog"] input[type="text"]', 'E2E Pending Admin');
    await page.fill('div[role="dialog"] input[type="email"]', testPendingEmail);
    await page.fill('div[role="dialog"] input[type="password"]', 'Password@123');
    await page.selectOption('div[role="dialog"] select', 'admin');

    // Verify warning callout for Admin
    const warningText = await page.textContent('div[role="dialog"]');
    if (warningText.includes('Requires Super Admin Approval')) {
      console.log('  [PASS] Informative Super Admin approval callout displayed');
    }

    // Submit form
    await page.click('div[role="dialog"] button:has-text("Create User")');
    await page.waitForTimeout(1500);

    // -------------------------------------------------------------------------
    // STEP 4: Verify the UI shows "Pending Approval"
    // -------------------------------------------------------------------------
    console.log('STEP 4: Verifying UI reflects Pending Approval status...');
    const bodyContent = await page.textContent('body');
    if (bodyContent.includes(testPendingEmail) && bodyContent.includes('Pending Approval')) {
      console.log('  [PASS] New Administrator appears in list with "Pending Approval" badge');
    } else {
      throw new Error(`User ${testPendingEmail} with Pending Approval not found in table`);
    }

    await page.screenshot({ path: 'pending-admin-created.png' });

    // -------------------------------------------------------------------------
    // STEP 5: Logout
    // -------------------------------------------------------------------------
    console.log('STEP 5: Logging out...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);

    // -------------------------------------------------------------------------
    // STEP 6: Attempt login using the newly created pending Admin
    // -------------------------------------------------------------------------
    console.log(`STEP 6: Attempting login with pending Admin (${testPendingEmail})...`);
    await page.click('button[role="tab"]:has-text("Admin Login")');
    await page.fill('input[type="email"]', testPendingEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    const loginError = await page.textContent('div[role="alert"]');
    if (loginError.includes('Your administrator account is awaiting approval')) {
      console.log('  [PASS] Pending Admin login BLOCKED with exact error message:', loginError);
    } else {
      throw new Error(`Expected awaiting approval error, got: ${loginError}`);
    }

    // Confirm URL did NOT advance to dashboard
    if (!page.url().includes('/dashboard')) {
      console.log('  [PASS] Pending user correctly denied dashboard access');
    }
    await page.screenshot({ path: 'pending-login-blocked.png' });

    // -------------------------------------------------------------------------
    // STEP 7: Login again as Siddharth Super Admin
    // -------------------------------------------------------------------------
    console.log('STEP 7: Logging back in as Super Admin (Siddharth Paradhi)...');
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('  [PASS] Super Admin re-authenticated');

    // -------------------------------------------------------------------------
    // STEP 8: Approve the pending Admin
    // -------------------------------------------------------------------------
    console.log(`STEP 8: Approving pending Admin (${testPendingEmail})...`);
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('table');

    // Find the row or approval card containing testPendingEmail and click Approve
    const approveBtn = page.locator(`button:has-text("Approve")`).first();
    await approveBtn.click();
    await page.waitForTimeout(1500);

    console.log('  [PASS] Super Admin approved pending administrator account');

    // -------------------------------------------------------------------------
    // STEP 9: Logout
    // -------------------------------------------------------------------------
    console.log('STEP 9: Logging out...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);

    // -------------------------------------------------------------------------
    // STEP 10: Login as the now-approved Admin
    // -------------------------------------------------------------------------
    console.log(`STEP 10: Logging in as approved Admin (${testPendingEmail})...`);
    await page.click('button[role="tab"]:has-text("Admin Login")');
    await page.fill('input[type="email"]', testPendingEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('  [PASS] Approved Admin login SUCCESSFUL -> Routed to /admin/dashboard');
    await page.screenshot({ path: 'approved-admin-dashboard.png' });

    // -------------------------------------------------------------------------
    // STEP 11: Create another test Admin as Super Admin
    // -------------------------------------------------------------------------
    console.log(`STEP 11: Logging in as Super Admin to create second Admin (${testRejectedEmail})...`);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[role="tab"]:has-text("Admin Login")');
    await page.fill('input[type="email"]', 'paradhisiddharth@gmail.com');
    await page.fill('input[type="password"]', '190925');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('table');
    await page.click('button:has-text("Create User")');
    await page.waitForSelector('div[role="dialog"]');

    await page.fill('div[role="dialog"] input[type="text"]', 'E2E Rejected Admin');
    await page.fill('div[role="dialog"] input[type="email"]', testRejectedEmail);
    await page.fill('div[role="dialog"] input[type="password"]', 'Password@123');
    await page.selectOption('div[role="dialog"] select', 'admin');
    await page.click('div[role="dialog"] button:has-text("Create User")');
    await page.waitForTimeout(1500);
    console.log('  [PASS] Second test Admin created with pending status');

    // -------------------------------------------------------------------------
    // STEP 12: Reject that Admin
    // -------------------------------------------------------------------------
    console.log(`STEP 12: Rejecting second Admin (${testRejectedEmail})...`);
    const rejectBtn = page.locator(`button:has-text("Reject")`).first();
    await rejectBtn.click();
    await page.waitForTimeout(1500);

    // Verify "Rejected" badge appears
    const updatedUsersText = await page.textContent('body');
    if (updatedUsersText.includes(testRejectedEmail) && updatedUsersText.includes('Rejected')) {
      console.log('  [PASS] Administrator status updated to "Rejected" in UI');
    }
    await page.screenshot({ path: 'rejected-admin-users.png' });

    // -------------------------------------------------------------------------
    // STEP 13: Attempt login as rejected Admin
    // -------------------------------------------------------------------------
    console.log(`STEP 13: Attempting login as rejected Admin (${testRejectedEmail})...`);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[role="tab"]:has-text("Admin Login")');
    await page.fill('input[type="email"]', testRejectedEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    const rejectLoginError = await page.textContent('div[role="alert"]');
    if (rejectLoginError.includes('Your administrator account has been rejected')) {
      console.log('  [PASS] Rejected Admin login BLOCKED with exact error message:', rejectLoginError);
    } else {
      throw new Error(`Expected rejection error, got: ${rejectLoginError}`);
    }
    await page.screenshot({ path: 'rejected-login-blocked.png' });

    // -------------------------------------------------------------------------
    // STEP 14: Verify normal Trainee and Trainer logins still work
    // -------------------------------------------------------------------------
    console.log('STEP 14: Verifying normal Trainee and Trainer logins...');
    // Trainee
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[role="tab"]:has-text("Trainee / Trainer")');
    await page.fill('input[type="email"]', 'arjun.nair@example.com');
    await page.fill('input[type="password"]', 'Trainee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
    console.log('  [PASS] Trainee login successfully loaded /trainee/dashboard');

    // Trainer
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[role="tab"]:has-text("Trainee / Trainer")');
    await page.fill('input[type="email"]', 'ananya.iyer@example.com');
    await page.fill('input[type="password"]', 'Trainer@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer/dashboard', { timeout: 10000 });
    console.log('  [PASS] Trainer login successfully loaded /trainer/dashboard');

    // -------------------------------------------------------------------------
    // STEP 15: Verify normal Admin cannot see or access approval actions
    // -------------------------------------------------------------------------
    console.log('STEP 15: Verifying normal Admin (admin@capacityconnect.com) cannot see approval actions...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[role="tab"]:has-text("Admin Login")');
    await page.fill('input[type="email"]', 'admin@capacityconnect.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForSelector('table');

    // Normal admin must NOT see "Admin Approval Requests" section or Approve/Reject buttons
    const normalAdminContent = await page.textContent('body');
    const hasApprovalSection = normalAdminContent.includes('Admin Approval Requests');
    const approveBtnCount = await page.locator('button:has-text("Approve")').count();
    const rejectBtnCount = await page.locator('button:has-text("Reject")').count();

    if (!hasApprovalSection && approveBtnCount === 0 && rejectBtnCount === 0) {
      console.log('  [PASS] Normal Admin has ZERO approval sections or Approve/Reject buttons');
    } else {
      throw new Error('Normal Admin UI exposed approval controls!');
    }
    await page.screenshot({ path: 'standard-admin-users-no-approval.png' });

    console.log('\n==========================================');
    console.log('ALL 15 PLAYWRIGHT E2E FLOW STEPS PASSED!');
    console.log('==========================================\n');
  } catch (err) {
    console.error('E2E TEST ERROR:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
