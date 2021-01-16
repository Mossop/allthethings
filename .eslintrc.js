module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json", "packages/*/tsconfig.json"],
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
    "packages/*/dist",
    "packages/*/node_modules",
  ],

  extends: [
    "plugin:mossop/typescript",
  ],
};
