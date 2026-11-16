import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Images import as { src, width, height }, as they do in Next. First, so it wins over "@".
      {
        find: /^.+\.(png|jpe?g|webp|avif|gif|svg)$/,
        replacement: new URL("./tests/unit/stubs/image.ts", import.meta.url).pathname,
      },
      // `server-only` exists only inside Next's build; in tests it is an empty module.
      {
        find: /^server-only$/,
        replacement: new URL("./tests/unit/stubs/server-only.ts", import.meta.url).pathname,
      },
      { find: "@", replacement: new URL("./src", import.meta.url).pathname },
    ],
  },
  test: {
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
});
