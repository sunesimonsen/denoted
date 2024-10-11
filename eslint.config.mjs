import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import eslintConfigPrettier from "eslint-config-prettier";
import mocha from "eslint-plugin-mocha";
import globals from "globals";

export default [
  {
    ignores: ["**/dist/", "**/node_modules/"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      import: fixupPluginRules(importPlugin),
      mocha,
      "@stylistic": stylistic,
    },

    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.browser,
        __DEV__: true,
      },

      ecmaVersion: 2020,
      sourceType: "module",
    },

    rules: {
      "no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["test/*.js", "vite.config.js", "eslint.config.mjs"],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],

      "mocha/no-exclusive-tests": "error",
      "mocha/no-nested-tests": "error",
      "mocha/no-identical-title": "error",
      "lines-between-class-members": "error",

      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",

          prev: [
            "block-like",
            "class",
            "multiline-expression",
            "export",
            "import",
            "const",
            "multiline-const",
          ],

          next: "*",
        },
        {
          blankLine: "always",
          prev: "*",

          next: [
            "block-like",
            "class",
            "return",
            "multiline-expression",
            "export",
            "const",
            "multiline-const",
          ],
        },
        {
          blankLine: "any",
          prev: ["import"],
          next: ["import"],
        },
        {
          blankLine: "any",
          prev: ["const", "let"],
          next: ["const", "let"],
        },
      ],
    },
  },
];
