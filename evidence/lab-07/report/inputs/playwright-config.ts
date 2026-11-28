import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: { baseURL: "http://localhost:5173", trace: "retain-on-failure" },
  webServer: [
    {
      command: "npm --prefix server run dev",
      url: "http://localhost:3000/api/health",
      reuseExistingServer: !process.env.CI
    },
    {
      command: "npm --prefix client run dev -- --port 5173 --strictPort",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI
    }
  ]
});
