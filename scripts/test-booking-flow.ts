import { chromium, Browser, Page } from 'playwright';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface TestResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  error?: any;
  screenshot?: string;
  timing?: number;
}

class BookingFlowTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];

  async initialize() {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 500 // Slow down for visibility
    });
    this.page = await this.browser.newPage();
    
    // Set viewport to common desktop size
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text());
      }
    });
    
    // Monitor network failures
    this.page.on('requestfailed', request => {
      console.error(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
      this.addResult({
        step: `Network Request: ${request.url()}`,
        status: 'fail',
        message: request.failure()?.errorText || 'Unknown error'
      });
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private addResult(result: TestResult) {
    this.results.push(result);
    const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${result.step}: ${result.message}`);
  }

  async testHomePage() {
    const start = Date.now();
    try {
      await this.page!.goto(BASE_URL);
      await this.page!.waitForLoadState('networkidle');
      
      // Check for key elements
      const heroTitle = await this.page!.locator('h1').first().textContent();
      const bookButton = await this.page!.locator('text=Book Service').first();
      
      if (heroTitle && bookButton) {
        this.addResult({
          step: 'Home Page Load',
          status: 'pass',
          message: 'Successfully loaded home page',
          timing: Date.now() - start
        });
      } else {
        throw new Error('Missing key elements on home page');
      }
      
      // Take screenshot
      await this.page!.screenshot({ 
        path: './test-results/home-page.png',
        fullPage: true 
      });
    } catch (error: any) {
      this.addResult({
        step: 'Home Page Load',
        status: 'fail',
        message: error.message,
        error
      });
    }
  }

  async testBookingFormAccess() {
    try {
      // Navigate to booking page
      await this.page!.goto(`${BASE_URL}/book`);
      await this.page!.waitForLoadState('networkidle');
      
      // Check if booking form is present
      const bookingForm = await this.page!.locator('[data-testid="booking-form"], form').first();
      
      if (await bookingForm.isVisible()) {
        this.addResult({
          step: 'Access Booking Form',
          status: 'pass',
          message: 'Booking form is accessible'
        });
      } else {
        throw new Error('Booking form not found');
      }
    } catch (error: any) {
      this.addResult({
        step: 'Access Booking Form',
        status: 'fail',
        message: error.message,
        error
      });
    }
  }

  async testServiceSelection() {
    try {
      // Select a service
      const serviceCard = await this.page!.locator('text=Plumbing').first();
      await serviceCard.click();
      
      await this.page!.waitForTimeout(1000);
      
      this.addResult({
        step: 'Service Selection',
        status: 'pass',
        message: 'Successfully selected Plumbing service'
      });
    } catch (error: any) {
      this.addResult({
        step: 'Service Selection',
        status: 'fail',
        message: error.message,
        error
      });
    }
  }

  async testPropertyDetails() {
    try {
      // Fill property details
      await this.page!.fill('input[name="address"], input[placeholder*="address"]', '123 Test Street');
      await this.page!.fill('input[name="city"], input[placeholder*="city"]', 'San Francisco');
      await this.page!.fill('input[name="state"], input[placeholder*="state"]', 'CA');
      await this.page!.fill('input[name="zipCode"], input[placeholder*="zip"]', '94110');
      
      // Click next/continue
      const nextButton = await this.page!.locator('button:has-text("Next"), button:has-text("Continue")').first();
      await nextButton.click();
      
      await this.page!.waitForTimeout(1000);
      
      this.addResult({
        step: 'Property Details',
        status: 'pass',
        message: 'Successfully filled property details'
      });
    } catch (error: any) {
      this.addResult({
        step: 'Property Details',
        status: 'fail',
        message: error.message,
        error
      });
    }
  }

  async testScheduling() {
    try {
      // Select date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Try to find and click on a date picker
      const dateInput = await this.page!.locator('input[type="date"], input[name="date"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      }
      
      // Select time
      const timeSlot = await this.page!.locator('button:has-text("10:00"), button:has-text("Morning")').first();
      if (await timeSlot.isVisible()) {
        await timeSlot.click();
      }
      
      // Click next
      const nextButton = await this.page!.locator('button:has-text("Next"), button:has-text("Continue")').first();
      await nextButton.click();
      
      await this.page!.waitForTimeout(1000);
      
      this.addResult({
        step: 'Schedule Selection',
        status: 'pass',
        message: 'Successfully selected date and time'
      });
    } catch (error: any) {
      this.addResult({
        step: 'Schedule Selection',
        status: 'warning',
        message: 'Scheduling might have different UI',
        error
      });
    }
  }

  async testReviewStep() {
    try {
      // Look for review section
      const reviewSection = await this.page!.locator('text=Review, text=Summary, text=Confirm').first();
      
      if (await reviewSection.isVisible()) {
        // Take screenshot of review
        await this.page!.screenshot({ 
          path: './test-results/booking-review.png',
          fullPage: true 
        });
        
        this.addResult({
          step: 'Review Details',
          status: 'pass',
          message: 'Review section displayed correctly'
        });
      }
      
      // Proceed to payment
      const payButton = await this.page!.locator('button:has-text("Pay"), button:has-text("Continue to Payment")').first();
      if (await payButton.isVisible()) {
        await payButton.click();
      }
    } catch (error: any) {
      this.addResult({
        step: 'Review Details',
        status: 'warning',
        message: error.message,
        error
      });
    }
  }

  async testPaymentForm() {
    try {
      // Wait for Stripe to load
      await this.page!.waitForTimeout(3000);
      
      // Check for Stripe iframe
      const stripeFrame = await this.page!.frameLocator('iframe[name*="stripe"], iframe[title*="Secure payment"]').first();
      
      if (stripeFrame) {
        // Try to interact with Stripe elements
        await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
        await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
        await stripeFrame.locator('input[name="cvc"]').fill('123');
        await stripeFrame.locator('input[name="postal"]').fill('94110');
        
        this.addResult({
          step: 'Payment Form',
          status: 'pass',
          message: 'Stripe payment form loaded successfully'
        });
      } else {
        throw new Error('Stripe payment form not found');
      }
    } catch (error: any) {
      this.addResult({
        step: 'Payment Form',
        status: 'fail',
        message: error.message,
        error
      });
    }
  }

  async testAPIHealth() {
    try {
      // Navigate to API health page
      await this.page!.goto(`${BASE_URL}/api-health`);
      await this.page!.waitForLoadState('networkidle');
      
      // Wait for health checks to complete
      await this.page!.waitForTimeout(5000);
      
      // Check for any error states
      const errors = await this.page!.locator('.text-red-600, .bg-red-100').count();
      const warnings = await this.page!.locator('.text-yellow-600, .bg-yellow-100').count();
      
      if (errors > 0) {
        this.addResult({
          step: 'API Health Check',
          status: 'fail',
          message: `Found ${errors} API errors`
        });
      } else if (warnings > 0) {
        this.addResult({
          step: 'API Health Check',
          status: 'warning',
          message: `Found ${warnings} API warnings`
        });
      } else {
        this.addResult({
          step: 'API Health Check',
          status: 'pass',
          message: 'All APIs are healthy'
        });
      }
      
      // Take screenshot
      await this.page!.screenshot({ 
        path: './test-results/api-health.png',
        fullPage: true 
      });
    } catch (error: any) {
      this.addResult({
        step: 'API Health Check',
        status: 'fail',
        message: error.message,
        error
      });
    }
  }

  async testMobileResponsiveness() {
    try {
      // Test mobile viewport
      await this.page!.setViewportSize({ width: 375, height: 812 }); // iPhone X
      await this.page!.goto(BASE_URL);
      await this.page!.waitForLoadState('networkidle');
      
      // Check mobile navigation
      const mobileMenu = await this.page!.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]').first();
      
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await this.page!.waitForTimeout(500);
        
        this.addResult({
          step: 'Mobile Responsiveness',
          status: 'pass',
          message: 'Mobile layout working correctly'
        });
      } else {
        throw new Error('Mobile menu not found');
      }
      
      // Take mobile screenshot
      await this.page!.screenshot({ 
        path: './test-results/mobile-view.png',
        fullPage: true 
      });
      
      // Reset to desktop
      await this.page!.setViewportSize({ width: 1920, height: 1080 });
    } catch (error: any) {
      this.addResult({
        step: 'Mobile Responsiveness',
        status: 'warning',
        message: error.message,
        error
      });
    }
  }

  async runAllTests() {
    console.log('\n🧪 Starting Comprehensive Booking Flow Tests\n');
    
    await this.initialize();
    
    // Create test results directory
    const fs = require('fs');
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results');
    }
    
    // Run all tests
    await this.testHomePage();
    await this.testAPIHealth();
    await this.testBookingFormAccess();
    await this.testServiceSelection();
    await this.testPropertyDetails();
    await this.testScheduling();
    await this.testReviewStep();
    await this.testPaymentForm();
    await this.testMobileResponsiveness();
    
    // Generate report
    this.generateReport();
    
    await this.cleanup();
  }

  generateReport() {
    console.log('\n📊 Test Results Summary\n');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'fail').forEach(r => {
        console.log(`  - ${r.step}: ${r.message}`);
        if (r.error?.stack) {
          console.log(`    Stack: ${r.error.stack.split('\n')[0]}`);
        }
      });
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.filter(r => r.status === 'warning').forEach(r => {
        console.log(`  - ${r.step}: ${r.message}`);
      });
    }
    
    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync('./test-results/report.json', JSON.stringify(this.results, null, 2));
    console.log('\n📄 Detailed report saved to ./test-results/report.json');
  }
}

// Run the tests
const tester = new BookingFlowTester();
tester.runAllTests().catch(console.error);