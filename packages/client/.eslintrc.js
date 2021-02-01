module.exports = {
  overrides: [{
    files: [
      "src/**/*.js",
      "src/**/*.jsx",
    ],

    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  }, {
    files: [
      "src/**/*.js",
      "src/**/*.jsx",
      "src/**/*.ts",
      "src/**/*.tsx",
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
