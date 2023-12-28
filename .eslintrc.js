module.exports = {
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
    {
      env: {
        browser: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
      ],
      files: ["src/**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./src/tsconfig.json",
      },
      plugins: ["@typescript-eslint", "react"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],
        "@typescript-eslint/no-floating-promises": [
          "error",
          { ignoreVoid: false, ignoreIIFE: false },
        ],
        "@typescript-eslint/no-misused-promises": "error",
      },
    },
  ],
  settings: {
    react: {
      version: "18.2.0",
    },
  },
};
