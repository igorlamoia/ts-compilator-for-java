import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/tests/integration/**/*.spec.ts"],
    environment: "node",
    globalSetup: "./src/tests/integration/global-setup.ts",
    setupFiles: ["./src/tests/integration/test-setup.ts"],
    maxWorkers: 1,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: /^@ts-compilator-for-java\/compiler\/src\//,
        replacement: path.resolve(__dirname, "../compiler/src") + "/",
      },
      {
        find: /^@ts-compilator-for-java\/compiler\//,
        replacement: path.resolve(__dirname, "../compiler/src") + "/",
      },
    ],
  },
});
