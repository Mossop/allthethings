module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "**/tsconfig.json",
    ],
  },

  env: {
    node: true,
    es6: true,
  },

  plugins: [
    "mossop",
  ],

  ignorePatterns: [
    "node_modules",
    "dist",
    "packages/*/dist",
    "packages/*/node_modules",
    "packages/*/types",
    "plugins/*/*/dist",
    "plugins/*/*/node_modules",
    "plugins/*/*/types",
  ],

  extends: [
    "plugin:mossop/typescript",
  ],
};
