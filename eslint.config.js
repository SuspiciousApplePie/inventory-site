import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  eslintConfigPrettier,
  {
    ignores: ["**/*.config.js", "!**/eslint.config.js", "node_modules"],
    files: ["./src/**/*.js"],
    rules: {
      "prefer-const": "error",
      "no-unused-vars": "error",
      "no-console": "warn",
      camelcase: "warn",
      eqeqeq: "error",
    },
  },
]);
