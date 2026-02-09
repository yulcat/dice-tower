/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  workers: 1,
  use: {
    headless: true,
    launchOptions: {
      args: ['--use-gl=swiftshader'],
    },
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'python3 -m http.server 3459 --bind 127.0.0.1',
    port: 3459,
    reuseExistingServer: false,
    timeout: 10000,
  },
};
