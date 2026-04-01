import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ["dist/**", "out-tsc/**"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    style: "off",
    perf: "warn",
    nursery: "off",
  },
});
