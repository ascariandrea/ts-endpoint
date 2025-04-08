import { coverageConfigDefaults, defineConfig } from "vitest/config";

const config = defineConfig({
  test: {
    globals: true,
    watch: false,
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "commitlint.config.cjs",
        "**/lib/**",
        "**/coverage/**",
        "**/vite.*.{mjs,ts,mts}",
        "**/vitest.*.{mjs,ts,mts}",
        "**/eslint.config.{mjs,ts,mts}",
        '**/__tests__/**',
        '**/__test__/**',
        "examples/**",
        "website/**",
        "test/**",
        "**/src/index.ts"
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
});

export default config;