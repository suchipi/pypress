import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["tests/globalSetup.ts"],
    setupFiles: ["tests/testSetup.ts"],
    maxConcurrency: 1,
  },
});
