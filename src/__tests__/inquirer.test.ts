import { confirm, input, select } from "@inquirer/prompts";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "node:fs";
import {
	confirmBuild,
	confirmOverwriteDocs,
	destination,
	saveConfig,
	source,
	testMode,
} from "../inquirer";
import { logger } from "../logger";

jest.mock("@inquirer/prompts");
jest.mock("node:fs");
jest.mock("../logger");

describe("inquirer functions", () => {
	let mockConfirm: jest.MockedFunction<typeof confirm>;
	let mockInput: jest.MockedFunction<typeof input>;
	let mockSelect: jest.MockedFunction<typeof select>;
	let mockLogger: jest.Mocked<typeof logger>;
	let mockFs: jest.Mocked<typeof fs>;

	beforeEach(() => {
		jest.resetAllMocks();
		mockConfirm = confirm as jest.MockedFunction<typeof confirm>;
		mockInput = input as jest.MockedFunction<typeof input>;
		mockSelect = select as jest.MockedFunction<typeof select>;
		mockLogger = logger as jest.Mocked<typeof logger>;
		mockFs = fs as jest.Mocked<typeof fs>;
	});

	describe("confirmBuild", () => {
		it("should return true when user confirms", async () => {
			mockConfirm.mockResolvedValue(true);
			const result = await confirmBuild();
			expect(result).toBe(true);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided build confirmation: true",
			);
		});

		it("should return false when user declines", async () => {
			mockConfirm.mockResolvedValue(false);
			const result = await confirmBuild();
			expect(result).toBe(false);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided build confirmation: false",
			);
		});
	});

	describe("confirmOverwriteDocs", () => {
		it("should return true when user confirms", async () => {
			mockConfirm.mockResolvedValue(true);
			const result = await confirmOverwriteDocs();
			expect(result).toBe(true);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided documentation overwrite confirmation: true",
			);
		});

		it("should return false when user declines", async () => {
			mockConfirm.mockResolvedValue(false);
			const result = await confirmOverwriteDocs();
			expect(result).toBe(false);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided documentation overwrite confirmation: false",
			);
		});
	});

	describe("destination", () => {
		it("should return valid file path", async () => {
			mockInput.mockResolvedValue("valid/path/file.md");
			const result = await destination();
			expect(result).toBe("valid/path/file.md");
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided destination: valid/path/file.md",
			);
		});

		it("should reject invalid file path", async () => {
			mockInput.mockImplementation((options) => {
				const prompt = new Promise<string>((resolve) => {
					if (options.validate) {
						const validationResult = options.validate("invalid.txt");
						expect(validationResult).toBe(
							"Invalid file path. Please enter a valid file name ending in .md",
						);
					}
					resolve("valid/path/file.md");
				}) as Promise<string> & { cancel: () => void };
				prompt.cancel = () => {};
				return prompt;
			});
			await destination();
		});
	});

	describe("saveConfig", () => {
		it("should return true when user confirms saving config", async () => {
			mockConfirm.mockResolvedValue(true);
			const result = await saveConfig();
			expect(result).toBe(true);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided save config: true",
			);
		});

		it("should return false when user declines saving config", async () => {
			mockConfirm.mockResolvedValue(false);
			const result = await saveConfig();
			expect(result).toBe(false);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided save config: false",
			);
		});
	});

	describe("source", () => {
		it("should return valid directory path", async () => {
			mockFs.existsSync.mockReturnValue(true);
			mockInput.mockResolvedValue("valid/directory");
			const result = await source();
			expect(result).toBe("valid/directory");
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided source: valid/directory",
			);
		});
		it("should reject non-existent directory", async () => {
			mockFs.existsSync.mockReturnValue(false);
			mockInput.mockImplementation((options) => {
				const prompt = new Promise<string>((resolve) => {
					if (options.validate) {
						const validationResult = options.validate("invalid/directory");
						expect(validationResult).toBe(
							"Invalid file path. Please enter a valid file path.",
						);
					}
					resolve("valid/directory");
				}) as Promise<string> & { cancel: () => void };
				prompt.cancel = () => {};
				return prompt;
			});
			await source();
		});
	});

	describe("testMode", () => {
		it("should return false when user chooses to save documentation", async () => {
			mockSelect.mockResolvedValue(false);
			const result = await testMode();
			expect(result).toBe(false);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided test mode: false",
			);
		});

		it("should return true when user chooses to test without writing", async () => {
			mockSelect.mockResolvedValue(true);
			const result = await testMode();
			expect(result).toBe(true);
			expect(mockLogger.verbose).toHaveBeenCalledWith(
				"User provided test mode: true",
			);
		});
	});
});
