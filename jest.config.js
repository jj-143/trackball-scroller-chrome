const { pathsToModuleNameMapper } = require("ts-jest")
const { compilerOptions } = require("./tsconfig.test.json")

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    ".*\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  testEnvironment: "jsdom",
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
}
