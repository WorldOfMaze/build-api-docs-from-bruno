/// <reference types="jest" />

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { SpyInstance } from "jest-mock";
import fs from "node:fs";
import type { Config } from "../../types";
import loadConfig, {
	overrideKeysFromCLI,
	readConfigFile,
	saveConfigToFile,
	validateConfig,
	writeConfigFile,
} from "../config";
import { DEFAULT_DEFAULT_CONFIG_FILE_NAME } from "../constants";
import * as inquirer from "../inquirer";
import { logger } from "../logger";

const mockConfig = {
	debug: false,
	destination: "./docs",
	source: "./collections",
	excludes: [],
	force: false,
	logOptions: {
		silent: false,
		verbose: false,
	},
};

jest.mock("node:fs", () => ({
	promises: {
		readFile: jest.fn(),
		writeFile: jest.fn(),
	},
	existsSync: jest.fn(),
	readFileSync: jest.fn(),
	writeFileSync: jest.fn(),
}));

const mockedFs = jest.mocked(fs, { shallow: false });
// const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock("node:fs");
jest.mock("../logger", () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
		verbose: jest.fn(),
	},
}));
jest.mock("../inquirer");
let mockExit: SpyInstance;
let mockConsoleLog: SpyInstance;

describe("loadConfig", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockedFs.existsSync.mockImplementation(() => false);
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest
			.spyOn(process, "exit")
			.mockImplementation((code?: string | number | null) => {
				throw new Error(`Process.exit called with code: ${code}`);
			}) as jest.Mock;
		mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation((code?: string | number | null) => {
				throw new Error(`Process exited with code ${code}`);
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			}) as any;
		mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
		global.config = undefined;
	});

	it("should return early if global config is already set", () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(global as any).config = { some: "config" };
		loadConfig({});
		expect(mockedFs.existsSync).not.toHaveBeenCalled();
	});

	it("should read the specified config file if it exists", () => {
		const mockConfig: Config = {
			source: "test-source",
			logOptions: { silent: true, verbose: false },
			destination: "test-destination.md",
			excludes: [],
		};
		mockedFs.existsSync.mockReturnValue(true);
		mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

		loadConfig({ "config-file": "custom-config.json" });

		expect(mockedFs.existsSync).toHaveBeenCalledWith(
			expect.stringContaining("custom-config.json"),
		);
		expect(mockedFs.readFileSync).toHaveBeenCalledWith(
			"custom-config.json",
			"utf-8",
		);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		expect((global as any).config).toEqual(expect.objectContaining(mockConfig));
	});

	it("should read the default config file if specified file does not exist", () => {
		const mockConfig: Config = {
			source: "test-source",
			logOptions: { silent: true, verbose: false },
			destination: "test-destination.md",
			excludes: [],
		};
		(fs.existsSync as jest.Mock).mockReturnValue(false);
		(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

		loadConfig({});

		expect(fs.readFileSync).toHaveBeenCalledWith(
			DEFAULT_DEFAULT_CONFIG_FILE_NAME,
			"utf-8",
		);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		expect((global as any).config).toEqual(expect.objectContaining(mockConfig));
	});

	it("should handle errors when reading the config file", () => {
		const mockError = new Error("Mock file read error");
		(mockedFs.existsSync as jest.Mock).mockReturnValue(true);
		(mockedFs.readFileSync as jest.Mock).mockImplementation(() => {
			throw mockError;
		});

		expect(() => readConfigFile("test-config.json")).toThrow(
			"Process exited with code 1",
		);
		expect(logger.error).toHaveBeenCalledWith(mockError);
		expect(logger.warn).toHaveBeenCalledWith(
			"Error reading config file; see process.log for details.",
		);
	});

	it("should handle errors when reading the default config file", () => {
		const mockError = new Error("Mock file read error");
		(mockedFs.existsSync as jest.Mock).mockReturnValue(false);
		(mockedFs.readFileSync as jest.Mock).mockImplementation(() => {
			throw mockError;
		});

		expect(() => readConfigFile("bad-config.json")).toThrow(
			"Process exited with code 1",
		);
		expect(logger.error).toHaveBeenCalledWith(mockError);
		expect(logger.warn).toHaveBeenCalledWith(
			"Error reading config file; see process.log for details.",
		);
	});

	it("should log warnings for unrecognized configuration keys and continue execution", () => {
		const config = {
			destination: "test-destination.md",
			source: "test-source",
			logOptions: {},
			unknownKey: "value",
		};
		validateConfig(config);
		expect(logger.warn).toHaveBeenCalledWith(
			expect.stringContaining("Unsupported key(s)"),
		);
		expect(mockExit).not.toHaveBeenCalled();
	});

	it("should log errors and exit for missing keys", () => {
		const config = {
			source: "test-source",
			logOptions: {},
			unknownKey: "value",
		};

		expect(() => validateConfig(config)).toThrow();

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("destination is required"),
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"Error validating config file; see process.log for details",
		);
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	it("should log errors and exit for invalid keys", () => {
		const config = {
			destination: "test-destination.md",
			source: "test-source",
			logOptions: {},
			unknownKey: "value",
		};

		expect(() => validateConfig({ ...config, destination: 123 })).toThrow();

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("expected string"),
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"Error validating config file; see process.log for details",
		);
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	it("should set missing keys to default values", () => {
		const mockConfig: Config = {
			source: "test-source",
			logOptions: {},
			destination: "test-destination.md",
		};
		const expectedConfig: Config = {
			source: "test-source",
			logOptions: { silent: false, verbose: false },
			destination: "test-destination.md",
			excludes: [],
		};
		(fs.existsSync as jest.Mock).mockReturnValue(true);
		(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

		loadConfig({});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		expect((global as any).config).toEqual(
			expect.objectContaining(expectedConfig),
		);
	});

	it("should override config with CLI arguments", () => {
		const mockConfig: Config = {
			source: "test-source",
			logOptions: {},
			destination: "test-destination.md",
		};
		(fs.existsSync as jest.Mock).mockReturnValue(true);
		(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

		loadConfig({ destination: "cli-destination.md", verbose: true });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		expect((global as any).config).toEqual(
			expect.objectContaining({
				source: "test-source",
				destination: "cli-destination.md",
				logOptions: { verbose: true, silent: false },
				excludes: [],
			}),
		);
	});

	it("should exit process when configData is null", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		const mockReadFileSync = jest
			.spyOn(fs, "readFileSync")
			.mockReturnValue("null");
		const mockExistsSync = jest.spyOn(fs, "existsSync").mockReturnValue(true);

		readConfigFile("test-config.json");

		expect(logger.error).toHaveBeenCalledWith("Problem reading config file.");
		expect(mockExit).toHaveBeenCalledWith(1);

		mockExit.mockRestore();
		mockReadFileSync.mockRestore();
		mockExistsSync.mockRestore();
	});
});

describe("validateConfig", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
	});

	it("should log warning if both silent and verbose are true and continue", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);

		const config = {
			destination: "test-destination.md",
			source: "test-source",
			logOptions: {
				verbose: true,
				silent: true,
			},
		};

		validateConfig(config);

		expect(logger.warn).toHaveBeenCalledWith(
			"Verbose and silent are mutually exclusive; ignoring both.",
		);
		expect(mockExit).not.toHaveBeenCalled();
	});

	it("should log warnings for unrecognized configuration keys and continue execution", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);

		const config = {
			destination: "test-destination.md",
			source: "test-source",
			logOptions: {},
			unknownKey: "value",
		};
		validateConfig(config);
		expect(logger.warn).toHaveBeenCalledWith(
			expect.stringContaining("Unsupported key(s)"),
		);
		expect(mockExit).not.toHaveBeenCalled();
	});

	it("should log errors and exit for missing keys", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
		const config = {
			source: "test-source",
			logOptions: {},
			unknownKey: "value",
		};

		validateConfig(config);

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("destination is required"),
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"Error validating config file; see process.log for details",
		);
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	it("should log errors and exit for invalid keys", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		const config = {
			destination: "test-destination.md",
			source: "test-source",
			logOptions: {},
			unknownKey: "value",
		};

		validateConfig({ ...config, destination: 123 });

		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("expected string"),
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"Error validating config file; see process.log for details",
		);
		expect(mockExit).toHaveBeenCalledWith(1);
	});
});

describe("overrideKeysFromCLI", () => {
	it("should override config with CLI arguments", () => {
		const config: Config = {
			source: "original-source",
			destination: "original-destination.md",
			header: "original-header",
			tail: "original-tail",
			excludes: [],
			logOptions: { silent: false, verbose: false },
		};

		const argv = {
			source: "cli-source",
			destination: "cli-destination.md",
			silent: true,
			verbose: true,
		};

		const result = overrideKeysFromCLI(config, argv);

		expect(result).toEqual({
			source: "cli-source",
			destination: "cli-destination.md",
			header: "original-header",
			tail: "original-tail",
			excludes: [],
			logOptions: { silent: true, verbose: true },
		});
	});

	it("should not override config keys that are not in CLI arguments", () => {
		const config: Config = {
			source: "original-source",
			destination: "original-destination.md",
			header: "original-header",
			tail: "original-tail",
			excludes: [],
			logOptions: { silent: false, verbose: false },
		};

		const argv = {
			source: "cli-source",
		};

		const result = overrideKeysFromCLI(config, argv);

		expect(result).toEqual({
			source: "cli-source",
			destination: "original-destination.md",
			header: "original-header",
			tail: "original-tail",
			excludes: [],
			logOptions: { silent: false, verbose: false },
		});
	});
});

describe("saveConfigToFile", () => {
	let mockReadFile: jest.Mock;
	mockedFs.writeFileSync = jest.fn();

	beforeEach(() => {
		mockedFs.promises.writeFile = jest.fn();

		jest.resetAllMocks();
		mockedFs.existsSync.mockReturnValue(true);

		mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

		jest.spyOn(inquirer, "saveConfig").mockResolvedValue(true);
		mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation((code?: string | number | null) => {
				throw new Error(`Process.exit called with code: ${code}`);
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			}) as any;

		mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
		global.config = undefined;

		mockReadFile = jest.fn();

		global.config = {
			destination: "test.md",
			source: "source",
			logOptions: {},
		};
	});

	it("should return if the is no change to the configuration", async () => {
		mockedFs.existsSync.mockReturnValue(true);
		mockedFs.readFileSync.mockReturnValue(JSON.stringify(global.config));

		await saveConfigToFile({ "config-file": "bruno-doc.config.json" });

		expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
	});

	it("should throw error if read fails", async () => {
		// mockConsoleLog.mockRestore();
		mockedFs.existsSync.mockReturnValue(true);
		mockedFs.readFileSync.mockImplementation(() => {
			throw new Error("Failed to read file");
		});

		await expect(
			saveConfigToFile({ "config-file": "new_config.json" }),
		).rejects.toThrow();
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringMatching(/^Problem reading/),
		);
	});

	it("should create a new config file if it doesn't exist", async () => {
		mockedFs.existsSync.mockReturnValue(false);
		const saveConfigSpy = jest
			.spyOn(inquirer, "saveConfig")
			.mockResolvedValue(true);
		await saveConfigToFile({ "config-file": "new_config.json" });

		expect(saveConfigSpy).toHaveBeenCalled();
		expect(saveConfigSpy.mock.results[0].value).resolves.toBe(true);
		expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
			"new_config.json",
			JSON.stringify(global.config, null, 2),
			"utf8",
		);

		expect(logger.info).toHaveBeenCalledWith("Configuration file updated!");
	});

	it("should update existing config file with merged data", async () => {
		mockedFs.promises.writeFile = jest.fn();
		mockedFs.existsSync.mockReturnValue(true);
		mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
		const saveConfigSpy = jest
			.spyOn(inquirer, "saveConfig")
			.mockResolvedValue(true);

		global.config = {
			destination: "test.md",
			source: "source",
			logOptions: {},
		};

		await saveConfigToFile({ "config-file": "bruno-doc.config.json" });
		expect(saveConfigSpy).toHaveBeenCalled();
		expect(saveConfigSpy.mock.results[0].value).resolves.toBe(true);

		expect(mockedFs.readFileSync).toHaveBeenCalledWith(
			"bruno-doc.config.json",
			"utf8",
		);

		expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
			"bruno-doc.config.json",
			JSON.stringify({ ...mockConfig, ...global.config }, null, 2),
			"utf8",
		);
		expect(logger.info).toHaveBeenCalledWith("Configuration file updated!");
	});

	it("should handle write errors", async () => {
		mockReadFile.mockImplementation(
			(_path: unknown, _encoding: unknown, callback: unknown) => {
				(callback as (err: NodeJS.ErrnoException | null, data: string) => void)(
					null,
					"{}",
				);
			},
		);

		const writeError = new Error("Process exited with code 1");
		const mockConsoleError = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});
		mockedFs.writeFileSync.mockImplementation(() => {
			throw writeError;
		});

		await expect(
			saveConfigToFile({ "config-file": "bruno-doc.config.json" }),
		).rejects.toThrow("Process exited with code 1");

		expect(mockConsoleError).toHaveBeenCalledWith({ err: writeError });
		expect(logger.error).toHaveBeenCalledWith(
			"Error saving configuration file to 'bruno-doc.config.json'",
		);
		expect(logger.error).toHaveBeenCalledWith(writeError);
	});

	it("should use custom config file name when provided", async () => {
		mockedFs.existsSync.mockReturnValue(true);
		mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
		mockedFs.writeFileSync.mockImplementation(() => {});

		const customConfigFile = "test-config-file";

		await saveConfigToFile({ "config-file": "test-config-file" });

		expect(mockedFs.readFileSync).toHaveBeenCalled();
		expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
			customConfigFile,
			expect.any(String),
			"utf8",
		);
	});
});

describe("writeConfigFile", () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockedFs.promises.writeFile.mockReset();
		global.config = {
			destination: "test.md",
			source: "source",
			logOptions: { silent: false, verbose: false },
		};
	});

	it("should write config data to file with proper formatting", async () => {
		await writeConfigFile({ "config-file": "test-config.json" });

		expect(mockedFs.promises.writeFile).toHaveBeenCalledWith(
			"test-config.json",
			JSON.stringify(global.config, null, 2),
			"utf8",
		);
		expect(logger.info).toHaveBeenCalledWith("Configuration file updated!");
	});

	it("should log verbose output when verbose logging is enabled", async () => {
		global.config = {
			destination: "test.md",
			source: "source",
			logOptions: {
				verbose: true,
			},
		};

		await writeConfigFile({ "config-file": "test-config.json" });

		expect(logger.verbose).toHaveBeenCalledWith(
			JSON.stringify(global.config, null, 2),
		);
	});

	it("should handle write errors and rethrow them", async () => {
		const writeError = new Error("Write failed");
		mockedFs.promises.writeFile.mockRejectedValue(writeError);

		await expect(
			writeConfigFile({ "config-file": "test-config.json" }),
		).rejects.toThrow(writeError);

		expect(logger.error).toHaveBeenCalledWith(
			"Error saving configuration file to 'test-config.json'",
		);
		expect(logger.error).toHaveBeenCalledWith(writeError);
	});
});
