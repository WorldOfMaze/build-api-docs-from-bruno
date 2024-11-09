import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "node:fs";
import { logger } from "../logger";
import * as utils from "../utils";
import { configFileExists, exhaustiveSwitchGuard } from "../utils";

jest.mock("node:fs", () => ({
	...jest.requireActual("node:fs"),
	accessSync: jest.fn(),
}));
jest.mock("../logger", () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
		verbose: jest.fn(),
	},
}));

describe("configFileExists", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should return true when file exists and is readable", () => {
		fs.accessSync.mockImplementation(() => true);

		expect(configFileExists("existing-config.json")).toBe(true);

		expect(fs.accessSync).toHaveBeenCalledWith(
			"existing-config.json",
			fs.constants.R_OK,
		);
	});

	it("should return false when file does not exist", () => {
		fs.accessSync.mockImplementation(() => {
			throw new Error("ENOENT");
		});

		expect(configFileExists("non-existing-config.json")).toBe(false);
	});

	it("should return false when file exists but is not readable", () => {
		fs.accessSync.mockImplementation(() => {
			throw new Error("EACCES");
		});

		expect(configFileExists("unreadable-config.json")).toBe(false);

		expect(fs.accessSync).toHaveBeenCalledWith(
			"unreadable-config.json",
			fs.constants.R_OK,
		);
	});

	it("should handle empty filename", () => {
		fs.accessSync.mockImplementation(() => {
			throw new Error("Invalid argument");
		});

		expect(configFileExists("")).toBe(false);

		expect(fs.accessSync).toHaveBeenCalledWith("", fs.constants.R_OK);
	});
});

describe("getFolderItems", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should return array of file names from folder", () => {
		const mockFiles = [
			{
				name: "file1.txt",
				isFile: () => true,
				isDirectory: () => false,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
			},
			{
				name: "file2.txt",
				isFile: () => true,
				isDirectory: () => false,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
			},
		];
		jest.spyOn(fs, "readdirSync").mockReturnValue(mockFiles);

		const result = utils.getFolderItems("test-folder");

		expect(result).toEqual(["file1.txt", "file2.txt"]);
		expect(fs.readdirSync).toHaveBeenCalledWith("test-folder", {
			withFileTypes: true,
		});
	});

	it("should filter out directories and return only files", () => {
		const mockEntities = [
			{
				name: "file.txt",
				isFile: () => true,
				isDirectory: () => false,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
			},
			{
				name: "folder",
				isFile: () => false,
				isDirectory: () => true,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
			},
			{
				name: "another.txt",
				isFile: () => true,
				isDirectory: () => false,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isSymbolicLink: () => false,
				isFIFO: () => false,
				isSocket: () => false,
			},
		];
		jest.spyOn(fs, "readdirSync").mockReturnValue(mockEntities);

		const result = utils.getFolderItems("test-folder");

		expect(result).toEqual(["file.txt", "another.txt"]);
	});

	it("should return empty array for empty folder", () => {
		jest.spyOn(fs, "readdirSync").mockReturnValue([]);

		const result = utils.getFolderItems("empty-folder");

		expect(result).toEqual([]);
	});

	it("should throw error when folder path is invalid", () => {
		jest.spyOn(fs, "readdirSync").mockImplementation(() => {
			throw new Error("ENOENT: no such directory");
		});

		expect(() => utils.getFolderItems("invalid-folder")).toThrow(
			"ENOENT: no such directory",
		);
	});
});

describe("exhaustiveSwitchGuard", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should throw error with default message when called with any value", () => {
		const testValue = "test";
		expect(() => exhaustiveSwitchGuard(testValue)).toThrow(
			"Unhandled value in switch statement: test.",
		);
	});

	it("should throw error with custom message when provided", () => {
		const testValue = 42;
		const customMessage = "Custom error message";
		expect(() => exhaustiveSwitchGuard(testValue, customMessage)).toThrow(
			customMessage,
		);
	});

	it("should throw error with undefined value", () => {
		const testValue = undefined;
		expect(() => exhaustiveSwitchGuard(testValue)).toThrow(
			"Unhandled value in switch statement: undefined.",
		);
	});

	it("should throw error with null value", () => {
		const testValue = null;
		expect(() => exhaustiveSwitchGuard(testValue)).toThrow(
			"Unhandled value in switch statement: null.",
		);
	});

	it("should throw error with object value", () => {
		const testValue = { key: "value" };
		expect(() => exhaustiveSwitchGuard(testValue)).toThrow(
			"Unhandled value in switch statement: [object Object].",
		);
	});
});

describe("getBruFiles", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it("should return only .bru files from the given source path", () => {
		const mockFiles = ["test1.bru", "test2.txt", "test3.bru", "test4.json"];
		const mockGetFolderItems = jest.fn().mockReturnValue(mockFiles);

		const result = utils.getBruFiles("testPath", mockGetFolderItems);

		expect(mockGetFolderItems).toHaveBeenCalledWith(
			expect.stringContaining("testPath"),
		);

		expect(result).toEqual(["test1.bru", "test3.bru"]);
	});

	it("should return empty array when no .bru files exist", () => {
		const mockFiles = ["test1.txt", "test2.json", "test3.md"];
		const mockGetFolderItems = jest.fn().mockReturnValue(mockFiles);

		const result = utils.getBruFiles("testPath", mockGetFolderItems);

		expect(result).toEqual([]);
	});

	it("should handle empty directory", () => {
		const mockGetFolderItems = jest.fn().mockReturnValue([]);

		const result = utils.getBruFiles("testPath", mockGetFolderItems);

		expect(result).toEqual([]);
	});

	it("should exit process when source path does not exist", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined);
		const mockGetFolderItems = jest.fn().mockImplementation(() => {
			throw new Error("Directory not found");
		});

		try {
			expect(
				utils.getBruFiles("nonexistentPath", mockGetFolderItems).toThrow(),
			);
		} catch (error) {}

		expect(mockExit).toHaveBeenCalledWith(1);
		expect(logger.warn).toHaveBeenCalledWith(
			"Source path 'nonexistentPath' does not exist",
		);
	});

	it("should rethrow error when error is not an instance of Error", () => {
		const mockGetFolderItems = jest.fn().mockImplementation(() => {
			throw "Unknown error";
		});

		expect(() => utils.getBruFiles("testPath", mockGetFolderItems)).toThrow(
			"Unknown error",
		);
	});
});

describe("getMetaData", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should retrieves the metadata section from the content of a .bru file", () => {
		const mockFileContent = `
			meta {
				name: Endpoint name
				type: http
				seq: 1
			}
				post {}
				docs {}
		`;
		const mockValidateConfig = jest.fn().mockReturnValue({
			logOptions: {
				silent: false,
			},
		});

		const result = utils.getMetaData(
			mockFileContent,
			"test.bru",
			mockValidateConfig,
		);

		expect(result).not.toContain("meta");
		expect(result).not.toContain("{");
		expect(result).not.toContain("}");
		expect(result).toContain("name: Endpoint name");
		expect(result).toContain("type: http");
		expect(result).toContain("seq: 1");
		expect(result).not.toContain("post");
		expect(result).not.toContain("docs");
		expect(logger.warn).not.toBeCalled();
	});

	it("should return null and log warning if there is no metadata", () => {
		const mockFileContent = `
				post {}
				docs {}
		`;
		const mockValidateConfig = jest.fn().mockReturnValue({
			logOptions: {
				silent: false,
			},
		});

		expect(
			utils.getMetaData(mockFileContent, "test.bru", mockValidateConfig),
		).toBeUndefined();
		expect(logger.warn).toHaveBeenCalledWith(
			"test.bru: Meta section is required to be a valid .bru file; skipping",
		);
	});

	it("should suppress logging if in silent mode", () => {
		const mockFileContent = `
				post {}
				docs {}
		`;
		const mockValidateConfig = jest.fn().mockReturnValue({
			logOptions: {
				silent: true,
			},
		});

		expect(
			utils.getMetaData(mockFileContent, "test.bru", mockValidateConfig),
		).toBeUndefined();
		expect(logger.warn).not.toHaveBeenCalled();
	});
});

describe("getEndpointName", () => {
	it("should return the endpoint name from the metadata", () => {
		const metaData = `
			name: Endpoint name
            type: http
            seq: 1`;

		expect(utils.getEndpointName(metaData)).toBe("Endpoint name");
		expect(logger.warn).not.toHaveBeenCalled();
	});

	it("should return undefined and log a warning if the endpoint name is not found", () => {
		const metaData = `
            type: http
            seq: 1`;

		expect(utils.getEndpointName(metaData)).toBeUndefined();
		expect(logger.warn).toHaveBeenCalledWith(
			"A name is required to be a valid .bru file; skipping",
		);
	});
});

describe("missingDocumentationContent", () => {
	it("should return content for missing documentation", () => {
		const result = utils.missingDocumentationContent("test.bru");

		expect(result).toContain("# test.bru");
		expect(result).toContain("This endpoint is not documented.");
	});
});

describe("processHeaderFile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should process herder file", () => {
		const mockConfig = {
			header: "header.md",
		};
		const mockTail = "Mock header file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(true);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processHeaderFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).toHaveBeenCalledTimes(1);
		expect(mockWriteSync).toHaveBeenCalledWith(1, mockTail);
		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"Processing header file: header.md",
		);
		expect(logger.warn).not.toHaveBeenCalled();
		expect(logger.info).not.toHaveBeenCalled();
	});

	it("should log warning if no header file specified", () => {
		const mockConfig = {};
		const mockTail = "Mock header file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(false);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processHeaderFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).not.toHaveBeenCalled();
		expect(mockWriteSync).not.toHaveBeenCalled();
		expect(logger.verbose).not.toHaveBeenCalled();

		expect(logger.warn).not.toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalledTimes(1);
		expect(logger.info).toHaveBeenCalledWith("No header file specified");
	});

	it("should log warning if header file does not exist", () => {
		const mockConfig = {
			header: "header.md",
		};
		const mockTail = "Mock header file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(false);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processHeaderFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).not.toHaveBeenCalled();
		expect(mockWriteSync).not.toHaveBeenCalled();
		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"Processing header file: header.md",
		);
		expect(logger.warn).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith(
			"Header file not found: header.md; skipping",
		);
		expect(logger.info).not.toHaveBeenCalled();
	});

	it("should log warning if unable to write output file", () => {
		const mockConfig = {
			header: "header.md",
		};
		const mockTail = "Mock header file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(true);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockImplementation(() => {
			throw new Error("File write error");
		});

		utils.processHeaderFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).toHaveBeenCalledTimes(1);
		expect(mockWriteSync).toHaveBeenCalledWith(1, mockTail);
		expect(mockWriteSync).toThrow();
		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"Processing header file: header.md",
		);
		expect(logger.warn).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith(
			"Error writing header to file: Error: File write error",
		);
		expect(logger.info).not.toHaveBeenCalled();
	});

	it("should suppress writing to file if in test mode", () => {
		globalThis.testMode = true;

		const mockConfig = {
			header: "header.md",
		};
		const mockTail = "Mock header file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(true);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processHeaderFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockWriteSync).not.toHaveBeenCalled();
	});
});

describe("processTailFile", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it("should process tail file", () => {
		globalThis.testMode = false;

		const mockConfig = {
			tail: "tail.md",
		};
		const mockTail = "Mock tail file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(true);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processTailFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).toHaveBeenCalledTimes(1);
		expect(mockWriteSync).toHaveBeenCalledWith(1, mockTail);
		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"Processing tail file: tail.md",
		);
		expect(logger.warn).not.toHaveBeenCalled();
		expect(logger.info).not.toHaveBeenCalled();
	});

	it("should log warning if no tail file specified", () => {
		const mockConfig = {};
		const mockTail = "Mock tail file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(false);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processTailFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).not.toHaveBeenCalled();
		expect(mockWriteSync).not.toHaveBeenCalled();
		expect(logger.verbose).not.toHaveBeenCalled();

		expect(logger.warn).not.toHaveBeenCalled();
		expect(logger.info).toHaveBeenCalledTimes(1);
		expect(logger.info).toHaveBeenCalledWith("No tail file specified");
	});

	it("should log warning if tail file does not exist", () => {
		const mockConfig = {
			tail: "tail.md",
		};
		const mockTail = "Mock tail file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(false);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processTailFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).not.toHaveBeenCalled();
		expect(mockWriteSync).not.toHaveBeenCalled();
		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"Processing tail file: tail.md",
		);
		expect(logger.warn).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith(
			"Tail file not found: tail.md; skipping",
		);
		expect(logger.info).not.toHaveBeenCalled();
	});

	it("should log warning if unable to write output file", () => {
		const mockConfig = {
			tail: "tail.md",
		};
		const mockTail = "Mock tail file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(true);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockImplementation(() => {
			throw new Error("File write error");
		});

		utils.processTailFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockReadFileSync).toHaveBeenCalledTimes(1);
		expect(mockWriteSync).toHaveBeenCalledWith(1, mockTail);
		expect(mockWriteSync).toThrow();
		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"Processing tail file: tail.md",
		);
		expect(logger.warn).toHaveBeenCalledTimes(1);
		expect(logger.warn).toHaveBeenCalledWith(
			"Error writing tail to file: Error: File write error",
		);
		expect(logger.info).not.toHaveBeenCalled();
	});

	it("should suppress writing to file if in test mode", () => {
		globalThis.testMode = true;

		const mockConfig = {
			header: "tail.md",
		};
		const mockTail = "Mock tail file content";
		const mockValidateConfig = jest.fn().mockReturnValue(mockConfig);
		const mockExistSync = jest.fn().mockReturnValue(true);
		const mockReadFileSync = jest.fn().mockReturnValue(mockTail);
		const mockWriteSync = jest.fn().mockReturnValue();

		utils.processHeaderFile(
			1,
			mockValidateConfig,
			mockExistSync,
			mockReadFileSync,
			mockWriteSync,
		);

		expect(mockWriteSync).not.toHaveBeenCalled();
	});
});

describe("readBruFileDocContent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return the docs section of the file", () => {
		const mockReadFileSync = jest.fn().mockReturnValue(`
				docs {
					Mock documentation content
				}`);
		const mockGetMetaData = jest.fn().mockReturnValue("meta data");
		const mockGetEndpointName = jest.fn().mockReturnValue("Endpoint name");
		const mockMissingDocumentationContent = jest
			.fn()
			.mockReturnValue("Missing documentation content");

		expect(
			utils.readBruFileDocContent(
				"test.bru",
				mockReadFileSync,
				mockGetMetaData,
				mockGetEndpointName,
				mockMissingDocumentationContent,
			),
		).toContain("Mock documentation content");
		expect(mockReadFileSync).toBeCalledWith("test.bru", "utf-8");
		expect(mockGetMetaData).not.toHaveBeenCalled();
		expect(mockGetEndpointName).not.toHaveBeenCalled();
		expect(mockMissingDocumentationContent).not.toHaveBeenCalled();
	});

	it("should return boilerplate if there is no doc section in file ", () => {
		const mockReadFileSync = jest.fn().mockReturnValue("");
		const mockGetMetaData = jest.fn().mockReturnValue("meta data");
		const mockGetEndpointName = jest.fn().mockReturnValue("Endpoint name");
		const mockMissingDocumentationContent = jest
			.fn()
			.mockReturnValue("Missing documentation content");

		expect(
			utils.readBruFileDocContent(
				"test.bru",
				mockReadFileSync,
				mockGetMetaData,
				mockGetEndpointName,
				mockMissingDocumentationContent,
			),
		).toContain("Missing documentation content");
		expect(mockReadFileSync).toBeCalledWith("test.bru", "utf-8");
		expect(mockGetMetaData).toHaveBeenCalledTimes(1);
		expect(mockGetEndpointName).toHaveBeenCalledTimes(1);
		expect(mockMissingDocumentationContent).toHaveBeenCalledTimes(1);
	});

	it("should return undefined if there is no doc section in file and there is no meta data", () => {
		const mockReadFileSync = jest.fn().mockReturnValue("");
		const mockGetMetaData = jest.fn().mockReturnValue(undefined);
		const mockGetEndpointName = jest.fn().mockReturnValue("Endpoint name");
		const mockMissingDocumentationContent = jest
			.fn()
			.mockReturnValue("Missing documentation content");

		expect(
			utils.readBruFileDocContent(
				"test.bru",
				mockReadFileSync,
				mockGetMetaData,
				mockGetEndpointName,
				mockMissingDocumentationContent,
			),
		).toBeUndefined();
		expect(mockReadFileSync).toBeCalledWith("test.bru", "utf-8");
		expect(mockGetMetaData).toHaveBeenCalledTimes(1);
		expect(mockGetEndpointName).not.toHaveBeenCalled();
		expect(mockMissingDocumentationContent).not.toHaveBeenCalled();
	});

	it("should undefined if there is no doc section in file and there is no endpoint name in the meta data", () => {
		const mockReadFileSync = jest.fn().mockReturnValue("");
		const mockGetMetaData = jest.fn().mockReturnValue("meta data");
		const mockGetEndpointName = jest.fn().mockReturnValue(undefined);
		const mockMissingDocumentationContent = jest
			.fn()
			.mockReturnValue("Missing documentation content");

		expect(
			utils.readBruFileDocContent(
				"test.bru",
				mockReadFileSync,
				mockGetMetaData,
				mockGetEndpointName,
				mockMissingDocumentationContent,
			),
		).toBeUndefined();
		expect(mockReadFileSync).toBeCalledWith("test.bru", "utf-8");
		expect(mockGetMetaData).toHaveBeenCalledTimes(1);
		expect(mockGetEndpointName).toHaveBeenCalledTimes(1);
		expect(mockMissingDocumentationContent).not.toHaveBeenCalled();
	});
});

describe("processBruFile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should process the .bru file", () => {
		globalThis.testMode = false;

		const mockValidateConfig = jest.fn().mockReturnValue({
			logger: { verbose: false },
		});
		const mockReadBruFileDocContent = jest
			.fn()
			.mockReturnValue("Endpoint documentation");
		const mockWriteSync = jest.fn();

		utils.processBruFile(
			"test.bru",
			1,
			mockValidateConfig,
			mockReadBruFileDocContent,
			mockWriteSync,
		);

		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith("Processing 'test.bru'");
		expect(mockWriteSync).toHaveBeenCalledTimes(1);
		expect(mockWriteSync).toHaveBeenCalledWith(1, "Endpoint documentation");
	});

	it("should skip the file if it is in the exclude list", () => {
		const mockValidateConfig = jest.fn().mockReturnValue({
			excludes: ["test.bru"],
			logger: { verbose: false },
		});
		const mockReadBruFileDocContent = jest
			.fn()
			.mockReturnValue("Endpoint documentation");
		const mockWriteSync = jest.fn();

		utils.processBruFile(
			"test.bru",
			1,
			mockValidateConfig,
			mockReadBruFileDocContent,
			mockWriteSync,
		);

		expect(logger.verbose).toHaveBeenCalledTimes(1);
		expect(logger.verbose).toHaveBeenCalledWith(
			"'test.bru' is in the exclude list; skipping",
		);
		expect(mockWriteSync).not.toHaveBeenCalled();
	});

	it("should suppress writing to file if in test mode", () => {
		globalThis.testMode = true;

		const mockValidateConfig = jest.fn().mockReturnValue({
			logger: { verbose: false },
		});
		const mockReadBruFileDocContent = jest
			.fn()
			.mockReturnValue("Endpoint documentation");
		const mockWriteSync = jest.fn();

		utils.processBruFile(
			"test.bru",
			1,
			mockValidateConfig,
			mockReadBruFileDocContent,
			mockWriteSync,
		);

		expect(mockWriteSync).not.toHaveBeenCalled();
	});
});

describe("validateConfig", () => {
	let originalConfig;

	beforeAll(() => {
		originalConfig = globalThis.config;
	});

	afterAll(() => {
		globalThis.config = originalConfig;
	});

	it("should return config if it is initialized", () => {
		const mockConfig = { key: "value" };
		globalThis.config = mockConfig;

		expect(utils.validateConfig()).toBe(mockConfig);
	});

	it("should log an error and exit if config is not initialized", () => {
		const mockExit = jest
			.spyOn(process, "exit")
			.mockImplementation(() => undefined);
		globalThis.config = undefined;

		utils.validateConfig();

		expect(logger.error).toBeCalledTimes(1);
		expect(logger.error).toBeCalledWith("Config is not initialized");
		expect(mockExit).toBeCalledTimes(1);
	});
});

describe("combineDocumentation", () => {
	let consoleErrorSpy;
	let originalConfig;
	let mockValidateConfig;
	let mockGetBruFiles;
	let mockExistSync;
	let mockDirname;
	let mockMkdirSync;
	let mockOpenSync;
	let mockProcessHeaderFile;
	let mockProcessBruFile;
	let mockProcessTailFile;
	let mockClose;
	let mockConfirmOverwriteDocs;
	let mockUnlinkSync;
	let mockExit;

	beforeAll(() => {
		originalConfig = globalThis.config;
	});

	afterAll(() => {
		globalThis.config = originalConfig;
	});

	beforeEach(() => {
		jest.clearAllMocks();
		consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		consoleErrorSpy = jest.spyOn(console, "log").mockImplementation(() => {});
		globalThis.testMode = false;
		mockValidateConfig = jest.fn().mockReturnValue({
			source: "source",
			destination: "output.md",
			force: false,
			logOptions: { verbose: false, silent: false },
		});
		mockGetBruFiles = jest.fn().mockReturnValue(["test1.bru", "test2.bru"]);
		mockExistSync = jest.fn().mockReturnValue(true);
		mockDirname = jest.fn().mockReturnValue("output");
		mockMkdirSync = jest.fn();
		mockOpenSync = jest.fn().mockReturnValue(1);
		mockProcessHeaderFile = jest.fn();
		mockProcessBruFile = jest.fn();
		mockProcessTailFile = jest.fn();
		mockClose = jest.fn();
		mockConfirmOverwriteDocs = jest.fn().mockResolvedValue(true);
		mockUnlinkSync = jest.fn().mockReturnValue(undefined);
		mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit was called");
		});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	it("should write the combine documentation to the file", async () => {
		globalThis.testMode = false;
		const mockValidateConfig = jest.fn().mockReturnValue({
			source: "source",
			destination: "output.md",
			force: false,
			logOptions: { verbose: false, silent: false },
		});

		await utils.combineDocumentation(
			mockValidateConfig,
			mockGetBruFiles,
			mockExistSync,
			mockDirname,
			mockMkdirSync,
			mockOpenSync,
			mockProcessHeaderFile,
			mockProcessBruFile,
			mockProcessTailFile,
			mockClose,
			mockConfirmOverwriteDocs,
			mockUnlinkSync,
		);
		expect(mockValidateConfig).toBeCalledTimes(1);

		expect(mockGetBruFiles).toBeCalledTimes(1);

		expect(logger.info).not.toBeCalled();
		expect(logger.warn).not.toBeCalled();
		expect(logger.error).not.toBeCalled();

		expect(mockExistSync).toBeCalledTimes(1);
		expect(mockExistSync).toBeCalledWith("output.md");
		expect(mockExistSync).toBeTruthy();

		expect(mockConfirmOverwriteDocs).toBeCalledTimes(1);
		expect(mockConfirmOverwriteDocs).toBeTruthy();

		expect(mockUnlinkSync).toBeCalledTimes(1);
		expect(mockUnlinkSync).toBeCalledWith("output.md");

		expect(mockDirname).toBeCalledTimes(1);

		expect(mockMkdirSync).toBeCalledTimes(1);
		expect(mockMkdirSync).toBeCalledWith("output", { recursive: true });

		expect(mockOpenSync).toBeCalledTimes(1);
		expect(mockOpenSync).toBeCalledWith("output.md", "w");

		expect(mockProcessHeaderFile).toBeCalledTimes(1);
		expect(mockProcessHeaderFile).toBeCalledWith(1);

		expect(mockProcessBruFile).toBeCalledTimes(2);
		expect(mockProcessBruFile).toBeCalledWith("test1.bru", 1);
		expect(mockProcessBruFile).toBeCalledWith("test2.bru", 1);

		expect(mockProcessTailFile).toBeCalledTimes(1);
		expect(mockProcessTailFile).toBeCalledWith(1);

		expect(mockClose).toBeCalledTimes(1);
	});

	it("should log a warning if no .bru files exist in the source directory", async () => {
		globalThis.testMode = false;

		const mockGetBruFiles = jest.fn().mockReturnValue([]);

		await utils.combineDocumentation(
			mockValidateConfig,
			mockGetBruFiles,
			mockExistSync,
			mockDirname,
			mockMkdirSync,
			mockOpenSync,
			mockProcessHeaderFile,
			mockProcessBruFile,
			mockProcessTailFile,
			mockClose,
			mockConfirmOverwriteDocs,
			mockUnlinkSync,
		);
		expect(mockValidateConfig).toBeCalledTimes(1);

		expect(mockGetBruFiles).toBeCalledTimes(1);

		expect(logger.info).not.toBeCalled();
		expect(logger.warn).toBeCalledTimes(1);
		expect(logger.warn).toBeCalledWith("No Bruno files found");
		expect(logger.error).not.toBeCalled();

		expect(mockExistSync).not.toBeCalled();

		expect(mockConfirmOverwriteDocs).not.toBeCalled();

		expect(mockUnlinkSync).not.toBeCalled();

		expect(mockDirname).not.toBeCalled();

		expect(mockMkdirSync).not.toBeCalled();

		expect(mockOpenSync).not.toBeCalled();

		expect(mockProcessHeaderFile).not.toBeCalled();

		expect(mockProcessBruFile).not.toBeCalled();

		expect(mockProcessTailFile).not.toBeCalled();

		expect(mockClose).not.toBeCalled();
	});

	it("should suppress writing the output file if in test mode", async () => {
		globalThis.testMode = true;

		await utils.combineDocumentation(
			mockValidateConfig,
			mockGetBruFiles,
			mockExistSync,
			mockDirname,
			mockMkdirSync,
			mockOpenSync,
			mockProcessHeaderFile,
			mockProcessBruFile,
			mockProcessTailFile,
			mockClose,
			mockConfirmOverwriteDocs,
			mockUnlinkSync,
		);
		expect(mockValidateConfig).toBeCalledTimes(1);

		expect(mockGetBruFiles).toBeCalledTimes(1);

		expect(logger.info).not.toBeCalled();
		expect(logger.warn).not.toBeCalled();
		expect(logger.error).not.toBeCalled();

		expect(mockExistSync).not.toBeCalled();

		expect(mockConfirmOverwriteDocs).not.toBeCalled();

		expect(mockUnlinkSync).not.toBeCalled();

		expect(mockDirname).toBeCalledTimes(1);

		expect(mockMkdirSync).not.toBeCalled();

		expect(mockOpenSync).not.toBeCalled();

		expect(mockProcessHeaderFile).toBeCalledTimes(1);
		expect(mockProcessHeaderFile).toBeCalledWith(0);

		expect(mockProcessBruFile).toBeCalledTimes(2);
		expect(mockProcessBruFile).toBeCalledWith("test1.bru", 0);
		expect(mockProcessBruFile).toBeCalledWith("test2.bru", 0);

		expect(mockProcessTailFile).toBeCalledTimes(1);
		expect(mockProcessTailFile).toBeCalledWith(0);

		expect(mockClose).not.toBeCalled();
	});

	it("should overwrite existing output file if in force mode", async () => {
		globalThis.testMode = false;
		const mockValidateConfig = jest.fn().mockReturnValue({
			source: "source",
			destination: "output.md",
			force: true,
			logOptions: { verbose: false, silent: false },
		});

		await utils.combineDocumentation(
			mockValidateConfig,
			mockGetBruFiles,
			mockExistSync,
			mockDirname,
			mockMkdirSync,
			mockOpenSync,
			mockProcessHeaderFile,
			mockProcessBruFile,
			mockProcessTailFile,
			mockClose,
			mockConfirmOverwriteDocs,
			mockUnlinkSync,
		);
		expect(mockValidateConfig).toBeCalledTimes(1);

		expect(mockGetBruFiles).toBeCalledTimes(1);

		expect(logger.info).not.toBeCalled();
		expect(logger.warn).not.toBeCalled();
		expect(logger.error).not.toBeCalled();

		expect(mockExistSync).toBeCalledTimes(1);
		expect(mockExistSync).toBeCalledWith("output.md");
		expect(mockExistSync).toBeTruthy();

		expect(mockConfirmOverwriteDocs).not.toBeCalled();

		expect(mockUnlinkSync).toBeCalledTimes(1);
		expect(mockUnlinkSync).toBeCalledWith("output.md");

		expect(mockDirname).toBeCalledTimes(1);

		expect(mockMkdirSync).toBeCalledTimes(1);
		expect(mockMkdirSync).toBeCalledWith("output", { recursive: true });

		expect(mockOpenSync).toBeCalledTimes(1);
		expect(mockOpenSync).toBeCalledWith("output.md", "w");

		expect(mockProcessHeaderFile).toBeCalledTimes(1);
		expect(mockProcessHeaderFile).toBeCalledWith(1);

		expect(mockProcessBruFile).toBeCalledTimes(2);
		expect(mockProcessBruFile).toBeCalledWith("test1.bru", 1);
		expect(mockProcessBruFile).toBeCalledWith("test2.bru", 1);

		expect(mockProcessTailFile).toBeCalledTimes(1);
		expect(mockProcessTailFile).toBeCalledWith(1);

		expect(mockClose).toBeCalledTimes(1);
	});

	it("should exit if user choses not to  overwrite existing file", async () => {
		globalThis.testMode = false;

		const mockConfirmOverwriteDocs = jest.fn().mockResolvedValue(false);

		try {
			await utils.combineDocumentation(
				mockValidateConfig,
				mockGetBruFiles,
				mockExistSync,
				mockDirname,
				mockMkdirSync,
				mockOpenSync,
				mockProcessHeaderFile,
				mockProcessBruFile,
				mockProcessTailFile,
				mockClose,
				mockConfirmOverwriteDocs,
				mockUnlinkSync,
			);
		} catch (error) {
			expect(error.message).toBe("process.exit was called");
		}
		expect(mockValidateConfig).toBeCalledTimes(1);

		expect(mockGetBruFiles).toBeCalledTimes(1);

		expect(logger.info).toBeCalledTimes(1);
		expect(logger.info).toBeCalledWith(
			"User has chosen to not overwrite existing file",
		);
		expect(logger.warn).not.toBeCalled();
		expect(logger.error).toBeCalledTimes(1);

		expect(mockExistSync).toBeCalledTimes(1);
		expect(mockExistSync).toBeCalledWith("output.md");
		expect(mockExistSync).toBeTruthy();

		expect(mockConfirmOverwriteDocs).toBeCalledTimes(1);

		expect(mockUnlinkSync).not.toBeCalled();

		expect(mockDirname).not.toBeCalled();

		expect(mockMkdirSync).not.toBeCalled();

		expect(mockOpenSync).not.toBeCalled();

		expect(mockProcessHeaderFile).not.toBeCalled();

		expect(mockProcessBruFile).not.toBeCalled();

		expect(mockProcessTailFile).not.toBeCalled();

		expect(mockClose).not.toBeCalled();

		expect(mockExit).toBeCalledWith(1);
	});

	it("should log error and exist if error occurs processing files", async () => {
		const mockExistSync = jest.fn().mockImplementation(() => {
			throw new Error("Error");
		});

		try {
			await utils.combineDocumentation(
				mockValidateConfig,
				mockGetBruFiles,
				mockExistSync,
				mockDirname,
				mockMkdirSync,
				mockOpenSync,
				mockProcessHeaderFile,
				mockProcessBruFile,
				mockProcessTailFile,
				mockClose,
			);
		} catch (error) {
			expect(logger.error).toBeCalledTimes(1);
			expect(logger.error).toBeCalledWith(new Error("Error"));
			expect(mockExit).toBeCalledTimes(1);
			expect(mockExit).toBeCalledWith(1);
		}
	});

	it("should throw error and exit if there is an error getting .bru files", async () => {
		globalThis.testMode = false;

		const mockGetBruFiles = jest.fn().mockImplementation(() => {
			throw new Error("Error");
		});

		try {
			await utils.combineDocumentation(
				mockValidateConfig,
				mockGetBruFiles,
				mockExistSync,
				mockDirname,
				mockMkdirSync,
				mockOpenSync,
				mockProcessHeaderFile,
				mockProcessBruFile,
				mockProcessTailFile,
				mockClose,
				mockConfirmOverwriteDocs,
				mockUnlinkSync,
			);
		} catch (error) {
			expect(error.message).toBe("process.exit was called");
			expect(mockValidateConfig).toBeCalledTimes(1);

			expect(mockGetBruFiles).toBeCalledTimes(1);

			expect(logger.info).not.toBeCalled();
			expect(logger.warn).not.toBeCalled();
			expect(logger.error).toBeCalledTimes(1);
			expect(logger.error).toBeCalledWith(new Error("Error"));

			expect(mockExistSync).not.toBeCalled();

			expect(mockConfirmOverwriteDocs).not.toBeCalled();

			expect(mockUnlinkSync).not.toBeCalled();

			expect(mockDirname).not.toBeCalled();

			expect(mockMkdirSync).not.toBeCalled();

			expect(mockOpenSync).not.toBeCalled();

			expect(mockProcessHeaderFile).not.toBeCalled();

			expect(mockProcessBruFile).not.toBeCalled();

			expect(mockProcessTailFile).not.toBeCalled();

			expect(mockClose).not.toBeCalled();

			expect(mockExit).toBeCalledTimes(1);
			expect(mockExit).toBeCalledWith(1);
		}
	});
});
