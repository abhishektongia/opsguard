import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can sign up and login', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Fill signup form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'securePassword123!');
    await page.fill('input[name="organizationName"]', 'My Company');
    await page.fill('input[name="organizationSlug"]', 'my-company');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('user can login with existing credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Dashboard should be visible
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('user cannot login with wrong password', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Alert Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/.*dashboard/);
  });

  test('user can view alerts list', async ({ page }) => {
    await page.goto('/alerts');

    // Wait for alerts to load
    await page.waitForSelector('[role="table"]');

    // Check alerts table is visible
    const table = page.locator('[role="table"]');
    await expect(table).toBeVisible();
  });

  test('user can filter alerts by severity', async ({ page }) => {
    await page.goto('/alerts');

    // Click P1 severity filter
    await page.click('button:has-text("P1")');

    // Check URL contains severity filter
    await expect(page).toHaveURL(/.*severity=P1/);
  });

  test('user can acknowledge an alert', async ({ page }) => {
    await page.goto('/alerts');

    // Click first alert
    const firstAlert = page.locator('[role="row"]').nth(1);
    await firstAlert.click();

    // Wait for alert detail to load
    await page.waitForSelector('button:has-text("Acknowledge")');

    // Click acknowledge button
    await page.click('button:has-text("Acknowledge")');

    // Check for success toast
    await expect(page.locator('text=Alert acknowledged')).toBeVisible();
  });

  test('user can resolve an alert', async ({ page }) => {
    await page.goto('/alerts');

    const firstAlert = page.locator('[role="row"]').nth(1);
    await firstAlert.click();

    await page.waitForSelector('button:has-text("Resolve")');
    await page.click('button:has-text("Resolve")');

    // Should show success message
    await expect(page.locator('text=Alert resolved')).toBeVisible();
  });

  test('user can bulk acknowledge multiple alerts', async ({ page }) => {
    await page.goto('/alerts');

    // Select first two alerts
    await page.click('input[type="checkbox"]', { nth: 1 });
    await page.click('input[type="checkbox"]', { nth: 2 });

    // Click bulk acknowledge
    await page.click('button:has-text("Acknowledge")');

    // Confirm action
    await page.click('button:has-text("Confirm")');

    // Check success
    await expect(page.locator('text=2 alerts acknowledged')).toBeVisible();
  });
});

test.describe('Incident Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('user can create an incident', async ({ page }) => {
    await page.goto('/incidents');

    // Click create incident button
    await page.click('button:has-text("Create Incident")');

    // Fill form
    await page.fill('input[name="title"]', 'Database Outage');
    await page.fill('textarea[name="description"]', 'Primary database is down');

    // Select severity
    await page.click('button:has-text("P1")');

    // Submit
    await page.click('button:has-text("Create")');

    // Check success
    await expect(page.locator('text=Incident created')).toBeVisible();
  });

  test('user can view incident timeline', async ({ page }) => {
    await page.goto('/incidents');

    // Click first incident
    const firstIncident = page.locator('[role="row"]').nth(1);
    await firstIncident.click();

    // Check timeline is visible
    await expect(page.locator('text=Timeline')).toBeVisible();
  });

  test('user can add timeline entry to incident', async ({ page }) => {
    await page.goto('/incidents');

    const firstIncident = page.locator('[role="row"]').nth(1);
    await firstIncident.click();

    // Fill timeline entry
    await page.fill('textarea[name="message"]', 'Database service restarted');

    // Submit
    await page.click('button:has-text("Add Update")');

    // Check success
    await expect(page.locator('text=Timeline entry added')).toBeVisible();
  });

  test('user can update incident status', async ({ page }) => {
    await page.goto('/incidents');

    const firstIncident = page.locator('[role="row"]').nth(1);
    await firstIncident.click();

    // Click status dropdown
    await page.click('select[name="status"]');

    // Select new status
    await page.click('option:has-text("Identified")');

    // Check success
    await expect(page.locator('text=Status updated')).toBeVisible();
  });
});

test.describe('Real-Time Features', () => {
  test('user receives toast notification when new alert is created', async ({
    page,
    context,
  }) => {
    // Login user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);

    // Open new page to create alert
    const page2 = await context.newPage();
    await page2.goto('/api/v1/alerts', {
      method: 'POST',
      data: {
        title: 'Real-time test alert',
        severity: 'P1',
        source: 'test',
      },
    });

    // Check for toast notification on original page
    await expect(
      page.locator('text=Real-time test alert')
    ).toBeVisible();

    await page2.close();
  });

  test('alert list updates when alert is acknowledged in real-time', async ({
    page,
    context,
  }) => {
    await page.goto('/alerts');

    // Get initial alert count
    const initialAlerts = await page.locator('[role="row"]').count();

    // Open new page to acknowledge an alert
    const page2 = await context.newPage();
    const firstAlertId = await page
      .locator('[role="row"]')
      .nth(1)
      .getAttribute('data-alert-id');

    await page2.goto(`/api/v1/alerts/${firstAlertId}/acknowledge`, {
      method: 'POST',
    });

    // Original page should update
    await page.waitForTimeout(500); // Wait for real-time update

    // Check alert status changed
    const updatedAlert = page.locator(`[data-alert-id="${firstAlertId}"]`);
    await expect(updatedAlert).toContainText('ACK');

    await page2.close();
  });
});

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('user can create notification rule', async ({ page }) => {
    await page.goto('/notifications');

    // Click New Rule
    await page.click('button:has-text("New Rule")');

    // Fill rule form
    await page.fill('input[name="name"]', 'P1 Alerts to Email');

    // Select P1 severity
    await page.click('button:has-text("P1")');

    // Select email channel
    await page.click('input[type="checkbox"][value="email"]');

    // Create rule
    await page.click('button:has-text("Create Rule")');

    // Check success
    await expect(
      page.locator('text=Notification rule created')
    ).toBeVisible();
  });

  test('user can view notification logs', async ({ page }) => {
    await page.goto('/notifications');

    // Click Activity Log tab
    await page.click('button:has-text("Activity Log")');

    // Wait for logs to load
    await page.waitForSelector('[role="table"]');

    // Check logs are visible
    const table = page.locator('[role="table"]');
    await expect(table).toBeVisible();
  });
});

test.describe('Billing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  test('user can view current plan', async ({ page }) => {
    await page.goto('/billing');

    // Check plan information is displayed
    await expect(page.locator('text=Current Plan')).toBeVisible();
    await expect(page.locator('text=/Pro|Starter|Free/')).toBeVisible();
  });

  test('user can view invoices', async ({ page }) => {
    await page.goto('/billing');

    // Check invoices section
    await expect(page.locator('text=Invoices')).toBeVisible();

    // Wait for invoices to load
    await page.waitForSelector('[role="table"]');
  });

  test('user can download invoice', async ({ page }) => {
    await page.goto('/billing');

    // Find first invoice download link
    const downloadLink = page.locator('a:has-text("Download")').first();
    await expect(downloadLink).toBeVisible();
  });
});
