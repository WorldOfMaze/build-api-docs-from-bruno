/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	collectCoverageFrom: ["./src/**/*.{js,ts}"],
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"^.+\\.ws.*$",
		"constants.ts",
		"schema.ts",
		"yargs.ts",
	],
	coverageReporters: ["text", "json-summary"],
	moduleFileExtensions: ["ts", "js"],
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
	testPathIgnorePatterns: ["/node_modules/"],
	transform: {
		"^.+\\.ts$": "ts-jest",
		"^.+\\.js$": "babel-jest",
	},
	verbose: true,
};
