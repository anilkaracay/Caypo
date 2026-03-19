import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/__tests__/e2e/**/*.e2e.test.ts"],
    globals: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    passWithNoTests: true,
  },
});
