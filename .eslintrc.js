module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "packages/*/tsconfig.json",
      "plugins/*/server/tsconfig.json",
      "plugins/*/client/tsconfig.json",
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
    "packages/*/dist",
    "packages/*/node_modules",
    "plugins/*/server/dist",
    "plugins/*/server/node_modules",
    "plugins/*/client/dist",
    "plugins/*/client/node_modules",
    "packages/ui/types",
  ],

  extends: [
    "plugin:mossop/typescript",
  ],
};
