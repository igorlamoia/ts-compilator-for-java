import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./packages/ide/src", import.meta.url)),
      "@ts-compilator-for-java/compiler/src": fileURLToPath(
        new URL("./packages/compiler/src", import.meta.url),
      ),
      "@ts-compilator-for-java/compiler": fileURLToPath(
        new URL("./packages/compiler/src", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
  },
});
