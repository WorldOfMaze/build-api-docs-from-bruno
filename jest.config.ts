// jest.config.js
module.exports = {
	collectCoverageFrom: ["./src/**/*.{js,ts}"],
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"^.+\\.ws.*$",
		"constants.ts",
		"schema.ts",
	],
	coverageReporters: ["text", "json-summary"],
	testPathIgnorePatterns: ["/node_modules/"],
	verbose: true,
};
