import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const routes = ['/', '/apply', '/auth', '/redesign', '/track'];
  const baseUrl = 'http://localhost:8080';

  for (const route of routes) {
    console.log(`\n--- Testing route: ${route} ---`);
    const errors: string[] = [];
    const logs: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(`Page Error: ${err.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(`Console Error: ${msg.text()}`);
      }
    });

    try {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      if (!response) {
        console.log(`Failed to load ${route}: No response`);
        continue;
      }

      console.log(`Status: ${response.status()}`);

      if (errors.length > 0) {
        console.log('Runtime Errors:');
        errors.forEach(e => console.log(`  - ${e}`));
      }

      if (logs.length > 0) {
        console.log('Console Errors:');
        logs.forEach(l => console.log(`  - ${l}`));
      }

      if (errors.length === 0 && logs.length === 0 && response.status() < 400) {
        console.log(`Route ${route} loaded successfully with no visible errors.`);
      }

    } catch (err) {
      console.log(`Failed to navigate to ${route}: ${(err as Error).message}`);
    }
  }

  await browser.close();
})();
