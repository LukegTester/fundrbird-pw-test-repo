import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import playwright from "eslint-plugin-playwright";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
      "playwright/.cache/**",
      "scripts/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts", "**/*.spec.ts"],
    rules: {
      "playwright/no-wait-for-timeout": "error",
      "playwright/no-force-option": "warn",
      "playwright/expect-expect": "error",
      "playwright/no-useless-not": "error",
    },
  },
  {
    files: ["src/**/*.ts", "config/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  {
    files: [
      "tests/**/*.ts",
      "**/*.spec.ts",
      "src/**/*.ts",
      "config/**/*.ts",
      "playwright.config.ts",
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "prettier/prettier": "error",
    },
  },
);
