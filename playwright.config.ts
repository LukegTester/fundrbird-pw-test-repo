import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./config/env.config";

export const authFile = ".auth/user.json";

export default defineConfig({
  testDir: "./tests",

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium-public",
      testMatch: "tests/ui/**/*.spec.ts",
      grep: /@non-logged/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    {
      name: "chromium-logged",
      testMatch: "tests/ui/**/*.spec.ts",
      grep: /@logged/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
  ],
});
