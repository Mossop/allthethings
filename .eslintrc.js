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
  ],

  extends: [
    "plugin:mossop/typescript",
  ],

  overrides: [{
    files: [
      "core/client/**/*.ts",
      "core/client/**/*.tsx",
      "core/ui/**/*.ts",
      "core/ui/**/*.tsx",
      "plugins/*/client/**/*.ts",
      "plugins/*/client/**/*.tsx",
    ],

    env: {
      node: false,
      es6: true,
      browser: true,
    },

    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },

    extends: [
      "plugin:mossop/react",
      "plugin:react-hooks/recommended",
    ],

    rules: {
      "react/jsx-fragments": ["warn", "syntax"],
      "react/react-in-jsx-scope": "off",
    },

    settings: {
      react: {
        version: "17.0",
      },
    },
  }],
};
