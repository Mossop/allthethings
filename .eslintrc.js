module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: [
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
      "modules/client/**/*.ts",
      "modules/client/**/*.tsx",
      "services/*/client/**/*.ts",
      "services/*/client/**/*.tsx",
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
