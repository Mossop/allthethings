module.exports = {
  overrides: [{
    files: ["src/**/*.ts", "src/**/*.tsx"],

    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },

    env: {
      node: false,
      es6: true,
      browser: true,
    },

    extends: [
      "plugin:mossop/react",
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
