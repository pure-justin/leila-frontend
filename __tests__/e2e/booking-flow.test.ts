import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://heyleila.com');
  });

  test('should complete a booking from homepage', async ({ page }) => {
    // Click on Plumbing service
    await page.click('text=Plumbing');
    
    // Should navigate to booking page
    await expect(page).toHaveURL(/.*book/);
    
    // Fill out booking form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '555-0123');
    await page.fill('input[name="address"]', '123 Test Street');
    
    // Select date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="date"]', tomorrow.toISOString().split('T')[0]);
    
    // Select time
    await page.selectOption('select[name="time"]', '14:00');
    
    // Add notes
    await page.fill('textarea[name="notes"]', 'Test booking from automated test');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Booking confirmed')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.click('text=Electrical');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();
  });

  test('should allow emergency booking', async ({ page }) => {
    await page.click('text=HVAC');
    
    // Click emergency toggle
    await page.click('label:has-text("Emergency Service")');
    
    // Fill minimal required fields
    await page.fill('input[name="firstName"]', 'Emergency');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', 'emergency@test.com');
    await page.fill('input[name="phone"]', '555-HELP');
    await page.fill('input[name="address"]', '456 Urgent Ave');
    
    await page.click('button[type="submit"]');
    
    // Should show emergency confirmation
    await expect(page.locator('text=Emergency service requested')).toBeVisible();
  });
});

test.describe('Contractor Signup Flow', () => {
  test('should complete contractor registration', async ({ page }) => {
    await page.goto('https://heyleila.com/contractor/signup');
    
    // Fill personal information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Contractor');
    await page.fill('input[name="email"]', `contractor${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirmPassword"]', 'Test123!@#');
    
    // Fill business information
    await page.fill('input[name="businessName"]', 'Test Plumbing Co');
    await page.fill('input[name="phone"]', '555-1234');
    
    // Select services
    await page.check('input[value="plumbing"]');
    await page.check('input[value="drain-cleaning"]');
    
    // Set hourly rate
    await page.fill('input[name="hourlyRate"]', '75');
    
    // Accept terms
    await page.check('input[name="terms"]');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('https://heyleila.com/contractor/signup');
    
    // Enter weak password
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    
    // Should show password requirements
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('https://heyleila.com');
    
    // Mobile menu should be visible
    const menuButton = page.locator('button[aria-label="Menu"]');
    await expect(menuButton).toBeVisible();
    
    // Click menu
    await menuButton.click();
    
    // Navigation should be visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Service cards should stack vertically
    const serviceCards = page.locator('[data-testid="service-card"]');
    const firstCard = await serviceCards.first().boundingBox();
    const secondCard = await serviceCards.nth(1).boundingBox();
    
    expect(firstCard?.y).toBeLessThan(secondCard?.y || 0);
  });
});

test.describe('PWA Features', () => {
  test('should have PWA manifest', async ({ page }) => {
    const response = await page.goto('https://heyleila.com/manifest.json');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest.name).toBe('Leila - Home Services');
    expect(manifest.short_name).toBe('Leila');
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('https://heyleila.com');
    
    // Wait for service worker
    await page.waitForTimeout(2000);
    
    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    });
    
    expect(hasServiceWorker).toBeTruthy();
  });
});

test.describe('API Integration', () => {
  test('should load API documentation', async ({ page }) => {
    const response = await page.goto('https://leila-api.onrender.com/api-docs');
    expect(response?.status()).toBe(200);
    
    // Swagger UI should load
    await expect(page.locator('text=Leila API')).toBeVisible();
    await expect(page.locator('text=/api/bookings')).toBeVisible();
  });

  test('should return API health status', async ({ page }) => {
    const response = await page.request.get('https://leila-api.onrender.com/');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.message).toBe('Leila API Gateway');
  });
});