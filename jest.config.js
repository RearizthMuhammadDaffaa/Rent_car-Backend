/** @type {import("jest").Config} */
export default {
  testEnvironment: "node",

  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
          },
          target: "es2023",
        },
        module: {
          type: "es6",
        },
      },
    ],
  },

  extensionsToTreatAsEsm: [".ts"],

  transformIgnorePatterns: [
    "node_modules/(?!(file-type)/)",
  ],

  testMatch: [
    "**/tests/**/*.test.ts",
  ],
};