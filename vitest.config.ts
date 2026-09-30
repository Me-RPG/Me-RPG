import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@me-rpg/engine": fileURLToPath(new URL("./packages/engine/src/index.ts", import.meta.url)),
      "@me-rpg/fitness-model": fileURLToPath(new URL("./packages/fitness-model/src/index.ts", import.meta.url)),
      "@me-rpg/content": fileURLToPath(new URL("./packages/content/src/index.ts", import.meta.url)),
    },
  },
  test: {
    include: ["packages/*/test/**/*.test.ts", "apps/mobile/src/**/*.test.ts"],
  },
});
