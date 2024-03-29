module.exports = {
  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["**/tsconfig.json"],
  },

  env: {
    node: true,
    es6: true,
  },

  plugins: ["mossop"],

  ignorePatterns: ["node_modules", "dist"],

  extends: ["plugin:mossop/typescript"],

  overrides: [
    {
      files: ["modules/**/*"],

      rules: {
        "no-console": "warn",
      },
    },
    {
      files: [
        "modules/client/**/*.ts",
        "modules/client/**/*.tsx",
        "modules/services/*/client/**/*.ts",
        "modules/services/*/client/**/*.tsx",
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

      extends: ["plugin:mossop/react"],

      settings: {
        react: {
          version: "17.0",
        },
      },
    },

    {
      files: ["modules/server/init/migrations/*.ts"],

      rules: {
        "max-len": "off",
      },
    },
  ],
};
