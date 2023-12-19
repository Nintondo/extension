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
        "plugin:promise/recommended",
      ],
      files: ["src/**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      plugins: ["@typescript-eslint", "react", "promise"],
      rules: {
        "no-restricted-syntax": [
          "error",
          {
            selector: "ExportDefaultDeclaration > ObjectExpression",
            message: "Assign instance to a variable before exporting as module default.",
          },
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": ["warn"],
      },
    },
  ],
  settings: {
    react: {
      version: "18.2.0",
    },
  },
};
