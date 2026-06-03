import path from "path";
import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./config/env.config";

export const STORAGE_STATE = path.join(__dirname, "tmp/session.json");

export default defineConfig({
  testDir: "./tests",
  globalSetup: require.resolve("./config/global.setup.ts"),

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
      name: "chromium-public",
      testMatch: "tests/ui/**/*.spec.ts",
      grep: /@non-logged/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },

    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      dependencies: ["chromium-public"],
    },

    {
      name: "chromium-logged",
      testMatch: "tests/ui/**/*.spec.ts",
      grep: /@logged/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
    },
  ],
});
