import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: '.protocol-builder/e2e-report/playwright-report.json' }],
    ['html', { open: 'never', outputFolder: '.protocol-builder/e2e-report/html' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      DATABASE_URL: 'postgresql://placeholder:placeholder@placeholder/placeholder',
      NEXTAUTH_URL: 'http://localhost:3001',
      NEXTAUTH_SECRET: 'test-secret-for-e2e-testing-only-32ch',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      STRIPE_SECRET_KEY: 'sk_test_placeholder',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
      STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID: 'price_starter_monthly',
      NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID: 'price_starter_annual',
      NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: 'price_pro_monthly',
      NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID: 'price_pro_annual',
    },
  },
})
