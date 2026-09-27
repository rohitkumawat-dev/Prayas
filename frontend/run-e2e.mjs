import { chromium } from 'playwright';

async function runTests() {
  console.log('Launching browser (channel: msedge)...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Test 1: Login Page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('form');
  await page.screenshot({ path: 'test-login.png' });
  console.log('Captured test-login.png');

  // Test 2: Trainee Login & Dashboard
  console.log('Logging in as Trainee (Alex Rivera)...');
  await page.fill('input[type="email"]', 'alex.rivera@example.com');
  await page.fill('input[type="password"]', 'Trainee@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/trainee/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1500); // allow data to load
  await page.screenshot({ path: 'test-trainee-dashboard.png' });
  console.log('Captured test-trainee-dashboard.png');

  // Test 3: Trainee Courses
  console.log('Navigating to Trainee Courses...');
  await page.goto('http://localhost:5173/trainee/courses');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-trainee-courses.png' });
  console.log('Captured test-trainee-courses.png');

  // Test 4: Trainee Certificates
  console.log('Navigating to Trainee Certificates...');
  await page.goto('http://localhost:5173/trainee/certificates');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-trainee-certificates.png' });
  console.log('Captured test-trainee-certificates.png');

  // Clear token & logout
  await page.evaluate(() => localStorage.clear());

  // Test 5: Trainer Login & Dashboard
  console.log('Logging in as Trainer (Sarah Chen)...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('form');
  await page.fill('input[type="email"]', 'sarah.chen@example.com');
  await page.fill('input[type="password"]', 'Trainer@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/trainer/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-trainer-dashboard.png' });
  console.log('Captured test-trainer-dashboard.png');

  // Test 6: Trainer Students
  console.log('Navigating to Trainer Students...');
  await page.goto('http://localhost:5173/trainer/students');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-trainer-students.png' });
  console.log('Captured test-trainer-students.png');

  // Test 7: Trainer Analytics
  console.log('Navigating to Trainer Analytics...');
  await page.goto('http://localhost:5173/trainer/analytics');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-trainer-analytics.png' });
  console.log('Captured test-trainer-analytics.png');

  // Clear token & logout
  await page.evaluate(() => localStorage.clear());

  // Test 8: Admin Login & Dashboard
  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('form');
  await page.fill('input[type="email"]', 'admin@capacityconnect.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-admin-dashboard.png' });
  console.log('Captured test-admin-dashboard.png');

  // Test 9: Admin Analytics
  console.log('Navigating to Admin Analytics...');
  await page.goto('http://localhost:5173/admin/analytics');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-admin-analytics.png' });
  console.log('Captured test-admin-analytics.png');

  // Test 10: Admin Users
  console.log('Navigating to Admin Users...');
  await page.goto('http://localhost:5173/admin/users');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-admin-users.png' });
  console.log('Captured test-admin-users.png');

  await browser.close();
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
