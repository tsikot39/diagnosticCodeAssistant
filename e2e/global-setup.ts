import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Logging in via API...');
    
    // Listen for responses to see what's happening
    page.on('response', async (response) => {
      if (response.url().includes('/auth/')) {
        console.log(`${response.url()} - ${response.status()} ${response.statusText()}`);
        if (!response.ok()) {
          const body = await response.text().catch(() => 'Could not read body');
          console.error('Response body:', body);
        }
      }
    });
    
    // Call login API directly to get token
    const response = await page.request.post(`${baseURL}/api/v1/auth/login`, {
      form: {
        username: 'admin',
        password: 'admin123',
      },
    });
    
    if (!response.ok()) {
      throw new Error(`Login API failed: ${response.status()} ${response.statusText()}`);
    }
    
    const { access_token } = await response.json();
    console.log('Token received, length:', access_token.length);
    
    // Navigate to app and set token in localStorage
    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
    }, access_token);
    
    console.log('Token saved to localStorage');
    
    // Reload page to trigger auth check with the token
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for auth check to complete
    await page.waitForTimeout(2000);
    
    // Now navigate to home page
    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
    
    // Verify we're logged in (not redirected to /login)
    const currentUrl = page.url();
    console.log('Final URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      // Check if there's an error in console
      const logs = [];
      page.on('console', msg => logs.push(msg.text()));
      await page.waitForTimeout(500);
      console.error('Page logs:', logs);
      await page.screenshot({ path: 'playwright/.auth/login-error.png' });
      throw new Error('Still on login page after setting token');
    }
    
    console.log('✅ Authentication setup complete, saving state...');
    await context.storageState({ path: 'playwright/.auth/user.json' });
    
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
    await page.screenshot({ path: 'playwright/.auth/login-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
