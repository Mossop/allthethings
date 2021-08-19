module.exports = {
  testTimeout: 1000,

  projects: [
    {
      displayName: "node",

      testEnvironment: "node",
      preset: "ts-jest",
      resetModules: true,
      clearMocks: true,

      testMatch: [
        `<rootDir>/modules/server/**/*.test.{js,jsx,ts,tsx}`,
        `<rootDir>/modules/schema/**/*.test.{js,jsx,ts,tsx}`,
        `<rootDir>/modules/services/*/server/**/*.test.{js,jsx,ts,tsx}`,
        `<rootDir>/modules/services/*/utils/**/*.test.{js,jsx,ts,tsx}`,
        `<rootDir>/modules/utils/**/*.test.{js,jsx,ts,tsx}`,
      ],
      testPathIgnorePatterns: [
        "<rootDir>/build/",
        "<rootDir>/packages/",
        "<rootDir>/node_modules/",
      ],
    },
  ],
};
