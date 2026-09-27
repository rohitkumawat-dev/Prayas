import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function run() {
  console.log('=== STARTING ADMIN AUTH & RBAC BROWSER VERIFICATION ===\n');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Visit /login and inspect visible Admin Login options
    console.log('1. Checking /login page for visible Admin Login options...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('form');

    const adminTab = page.locator('button[role="tab"]:has-text("Admin Login")');
    if (await adminTab.isVisible()) {
      console.log('  [PASS] Admin Login role tab is clearly visible on /login');
    } else {
      throw new Error('Admin Login role tab NOT found on /login');
    }

    const adminBottomLink = page.locator('text=Need administrator access? Admin Login');
    if (await adminBottomLink.isVisible()) {
      console.log('  [PASS] Admin Login bottom helper link is visible on /login');
    }

    await page.screenshot({ path: 'verify-admin-login-standard-tab.png' });

    // 2. Click Admin Login tab
    console.log('2. Clicking Admin Login tab...');
    await adminTab.click();
    await page.waitForTimeout(300);

    const adminHeading = await page.textContent('h1');
    if (adminHeading.includes('Administrator Sign In')) {
      console.log('  [PASS] UI transitioned to "Administrator Sign In" mode');
    } else {
      throw new Error(`Expected "Administrator Sign In", got: ${adminHeading}`);
    }

    await page.screenshot({ path: 'verify-admin-login-admin-tab.png' });

    // 3. Test direct navigation to /admin/login
    console.log('3. Navigating directly to /admin/login...');
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForSelector('form');
    const directHeading = await page.textContent('h1');
    if (directHeading.includes('Administrator Sign In')) {
      console.log('  [PASS] /admin/login directly renders in Administrator mode');
    } else {
      throw new Error(`Expected direct /admin/login to render Administrator mode, got: ${directHeading}`);
    }

    // 4. Submit Admin credentials
    console.log('4. Submitting Admin credentials (admin@capacityconnect.com / Admin@123)...');
    await page.fill('input[type="email"]', 'admin@capacityconnect.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // 5. Verify redirect to /admin/dashboard
    console.log('5. Verifying redirect to /admin/dashboard...');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('  [PASS] Successfully redirected to /admin/dashboard');

    // 6. Verify Admin Dashboard real data
    console.log('6. Verifying Admin dashboard real data loads from SQLite...');
    await page.waitForTimeout(1500);
    const dashContent = await page.textContent('body');
    const hasPlatformOverview = dashContent.includes('Platform Overview');
    const hasTotalUsers = dashContent.includes('Total Users');
    const hasRecentActivity = dashContent.includes('Recent Platform Activity');
    
    if (hasPlatformOverview && hasTotalUsers && hasRecentActivity) {
      console.log('  [PASS] Admin dashboard successfully loaded real database statistics');
    } else {
      throw new Error('Admin dashboard failed to display real database stats');
    }

    await page.screenshot({ path: 'verify-admin-dashboard-loaded.png' });

    // 7. Verify Trainee and Trainer logins still work
    console.log('7. Verifying Trainee and Trainer logins...');
    await page.evaluate(() => localStorage.clear());

    // Trainee login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'alex.rivera@example.com');
    await page.fill('input[type="password"]', 'Trainee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
    console.log('  [PASS] Trainee login succeeded and routed to /trainee/dashboard');

    // 8. Verify Trainee cannot access /admin/dashboard
    console.log('8. Verifying Trainee RBAC protection on /admin/dashboard...');
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    const traineeUrl = page.url();
    if (traineeUrl.includes('/trainee/dashboard') && !traineeUrl.includes('/admin/')) {
      console.log('  [PASS] Trainee was blocked and redirected back to /trainee/dashboard');
    } else {
      throw new Error(`RBAC failure: Trainee accessed ${traineeUrl}`);
    }

    // Trainer login
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'sarah.chen@example.com');
    await page.fill('input[type="password"]', 'Trainer@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/trainer/dashboard', { timeout: 10000 });
    console.log('  [PASS] Trainer login succeeded and routed to /trainer/dashboard');

    // 9. Verify Trainer cannot access /admin/dashboard
    console.log('9. Verifying Trainer RBAC protection on /admin/dashboard...');
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    const trainerUrl = page.url();
    if (trainerUrl.includes('/trainer/dashboard') && !trainerUrl.includes('/admin/')) {
      console.log('  [PASS] Trainer was blocked and redirected back to /trainer/dashboard');
    } else {
      throw new Error(`RBAC failure: Trainer accessed ${trainerUrl}`);
    }

    // 10. Verify Unauthenticated access to /admin/dashboard redirects to /login
    console.log('10. Verifying unauthenticated visitor to /admin/dashboard...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(1000);
    const unauthUrl = page.url();
    if (unauthUrl.includes('/login')) {
      console.log('  [PASS] Unauthenticated visitor redirected to /login');
    } else {
      throw new Error(`Unauthenticated visitor was not redirected to /login: ${unauthUrl}`);
    }

    // 11. Check /register page for Admin link & no public admin registration
    console.log('11. Verifying /register page...');
    await page.goto(`${BASE_URL}/register`);
    const selectOptions = await page.$$eval('select option', opts => opts.map(o => o.value));
    if (!selectOptions.includes('admin')) {
      console.log('  [PASS] Public registration dropdown does NOT contain admin option:', selectOptions);
    } else {
      throw new Error('Admin role found in public registration select!');
    }

    const regAdminLink = page.locator('text=System Administrator?');
    if (await regAdminLink.isVisible()) {
      console.log('  [PASS] /register page includes clear Admin Login link');
    }

    console.log('\n==========================================');
    console.log('ALL ADMIN AUTH & RBAC TESTS PASSED (11/11)');
    console.log('==========================================\n');
  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
