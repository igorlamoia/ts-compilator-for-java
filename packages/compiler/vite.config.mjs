import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    deps: {
      // This allows Vitest to handle ES modules correctly
      interopDefault: true,
    },
  },
  build: {
    target: "es2020", // Or adjust to the ES target you need
    outDir: "./build",
  },
});
