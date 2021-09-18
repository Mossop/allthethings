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

  rules: {
    "import/named": "off",
    "import/namespace": "off",
    "import/default": "off",
    "import/no-named-as-default-member": "off",
    "import/no-unresolved": "off",
    "no-console": "warn",
  },

  overrides: [
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

      rules: {
        "import/named": "off",
        "import/namespace": "off",
        "import/default": "off",
        "import/no-named-as-default-member": "off",
        "import/no-unresolved": "off",
      },

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
