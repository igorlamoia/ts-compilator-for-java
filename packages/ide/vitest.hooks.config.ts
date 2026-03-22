import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: [
      "src/tests/integration/hooks/**/*.spec.ts",
      "src/tests/integration/compiler/run-lexer.spec.ts",
      "src/tests/integration/compiler/run-intermediator.spec.ts",
      "src/pages/api/__tests__/lexer-config.spec.ts",
      "src/pages/api/__tests__/intermediator-config.spec.ts",
    ],
    environment: "node",
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
