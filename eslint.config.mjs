import globals from "globals";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    settings: {
        react: {
            version: "18.2.0",
        },
    },
}, {
    files: ["**/.eslintrc.{js,cjs}"],

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },

        ecmaVersion: 5,
        sourceType: "commonjs",
    },
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
)).map(config => ({
    ...config,
    files: ["src/**/*.{ts,tsx}"],
})), {
    files: ["src/**/*.{ts,tsx}"],

    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        react: fixupPluginRules(react),
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: "./src/tsconfig.json",
        },
    },

    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],

        "@typescript-eslint/no-floating-promises": ["error", {
            ignoreVoid: false,
            ignoreIIFE: false,
        }],
    },
}, {
    files: ["./build.ts"],

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],

        "@typescript-eslint/no-floating-promises": ["error", {
            ignoreVoid: false,
            ignoreIIFE: false,
        }],

        "@typescript-eslint/no-misused-promises": "error",
    },
}];