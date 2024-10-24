import { existsSync, promises as fs, unlinkSync, type Dirent } from "node:fs";
import path from "node:path";
import type { Config } from "../types";
import { confirmOverwriteDocs } from "./inquirer";
import { logger } from "./logger";

/**
 * Checks if a configuration file exists and is readable.
 *
 * @param configFileName - The path to the configuration file to check.
 * @returns A Promise that resolves to `true` if the configuration file exists and is readable, `false` otherwise.
 * @throws {Error} If an error occurs while checking the file.
 */
export async function configFileExists(
	configFileName: string,
): Promise<boolean> {
	try {
		await fs.access(configFileName, fs.constants.R_OK);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Combines the documentation from multiple ".bru" files into a single output file.
 *
 * This function retrieves a list of ".bru" files from the specified source path, deletes the existing output file if it exists, creates the output file and its directory if necessary, and then processes each ".bru" file, writing its contents to the output file.
 *
 * @returns A Promise that resolves when the documentation has been combined.
 * @throws {Error} If an error occurs while processing the ".bru" files or creating the output file.
 */
export async function combineDocumentation(): Promise<void> {
	const config = validateConfig();
	try {
		const files = await getBruFiles(config.source);
		if (!files || files.length === 0) {
			logger.warn("No Bruno files found");
			return;
		}
		let outFileHandle = undefined;
		try {
			if (!globalThis.testMode) {
				if (
					existsSync(config.destination) &&
					!config?.force &&
					!config?.logOptions.silent
				) {
					const overwrite = await confirmOverwriteDocs();
					if (overwrite) {
						unlinkSync(config.destination);
					} else {
						logger.info("User has chosen to not overwrite existing file");
						process.exit(1);
					}
				}

				const dirName = path.dirname(config.destination);
				await fs.mkdir(dirName, { recursive: true });
				outFileHandle = await fs.open(config.destination, "w");
			}
		} catch (error) {
			logger.error(error);
			process.exit(1);
		}

		await processHeaderFile(outFileHandle);
		for (let ndx = 0; ndx < files.length; ndx++) {
			if (files[ndx]) {
				await processBruFile(files[ndx], outFileHandle);
			}
		}
		await processTailFile(outFileHandle);

		if (outFileHandle) {
			await outFileHandle.close();
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw "An unknown error occurred";
	}
}

/**
 * Throws an error with the provided message if the `value` parameter is not of type `never`.
 * This function is intended to be used as a guard in exhaustive switch statements to ensure all possible cases are handled.
 *
 * @param value - The value to check. This should be of type `never` if the switch statement is exhaustive.
 * @param message - The error message to throw if `value` is not of type `never`. Defaults to a generic message.
 * @throws {Error} If `value` is not of type `never`.
 */
export function exhaustiveSwitchGuard(
	value: never,
	message = `Unhandled value in switch statement: ${value}.`,
): void {
	throw new Error(message);
}

/**
 * Retrieves a list of ".bru" files from the specified source path.
 *
 * @param sourcePath - The path to the folder containing the ".bru" files.
 * @returns A Promise that resolves to an array of file paths for the ".bru" files found in the source path and its subdirectories.
 * @throws {Error} If the source path does not exist.
 */
async function getBruFiles(sourcePath: string) {
	try {
		const files = await getFolderItems(path.join(__dirname, "..", sourcePath));
		return files.filter((file) => file.endsWith(".bru"));
	} catch (error) {
		if (error instanceof Error) {
			logger.warn(`Source path '${sourcePath}' does not exist`);
			process.exit(1);
		}
		throw error;
	}
}

/**
 * Retrieves the contents of a folder, recursively traversing any subdirectories.
 *
 * @param folderPath - The path to the folder to retrieve the contents of.
 * @returns A Promise that resolves to an array of file paths within the folder and its subdirectories.
 */
async function getFolderItems(folderPath: string): Promise<string[]> {
	const folderEntities = (await fs.readdir(folderPath, {
		withFileTypes: true,
	})) as Dirent[];
	const files: (string | string[])[] = await Promise.all(
		folderEntities.map((entity) => {
			const res = path.resolve(folderPath, entity.name);
			return entity.isDirectory() ? getFolderItems(res) : res;
		}),
	);
	return Array.prototype.concat(...files);
}

/**
 * Retrieves the metadata section from the content of a ".bru" file.
 *
 * @param fileContent - The content of the ".bru" file.
 * @param fileName - The name of the ".bru" file.
 * @returns The metadata section as a string, or `undefined` if the metadata section is not found or is empty.
 */
function getMetaData(
	fileContent: string,
	fileName: string,
): string | undefined {
	const metaData = fileContent.match(/meta \{([^}]*)\}/);
	const config = validateConfig();
	if (!metaData) {
		if (!config.logOptions.silent)
			logger.warn(
				`${fileName}: Meta section is required to be a valid .bru file; skipping`,
			);
		return;
	}
	return metaData[1];
}
/**
 * Retrieves the name of an endpoint from the metadata section of a ".bru" file.
 *
 * @param metaData - The metadata section of the ".bru" file.
 * @returns The name of the endpoint, or `undefined` if the name is not found or is empty.
 */
function getEndpointName(metaData: string): string | undefined {
	const name = metaData.match(/.*name:\s*(.*)/i);
	if (!name || name[1] === "") {
		logger.warn("A name is required to be a valid .bru file; skipping");
		return;
	}
	return name[1];
}

/**
 * Generates a message indicating that the documentation content for the specified '.bru' file is missing.
 *
 * @param fileName - The name of the '.bru' file that is missing documentation.
 * @returns A string containing the message indicating the missing documentation.
 */
function missingDocumentationContent(fileName: string): string {
	return `
# ${fileName}

This endpoint is not documented.
`;
}

/**
 * Processes a '.bru' file by reading its documentation content and writing it to a file handle.
 *
 * @param fileName - The path to the '.bru' file to process.
 * @param fileHandle - An optional file handle to write the documentation content to.
 * @returns A Promise that resolves when the file has been processed.
 */
async function processBruFile(
	fileName: string,
	fileHandle: fs.FileHandle | undefined,
) {
	const config = validateConfig();

	if (config.excludes?.includes(path.basename(fileName))) {
		logger.verbose(`'${fileName}' is in the exclude list; skipping`);
	} else {
		logger.verbose(`Processing '${fileName}'`);
		const endpointDocumentation = await readBruFileDocContent(fileName);
		if (fileHandle && endpointDocumentation) {
			await fileHandle.write(`${endpointDocumentation}`);
		}
	}
}

async function processHeaderFile(
	fileHandle: fs.FileHandle | undefined,
): Promise<void> {
	const headerFile = validateConfig().header;
	if (headerFile) {
		logger.verbose(`Processing header file: ${headerFile}`);
		if (existsSync(headerFile)) {
			const headerFileContent = await fs.readFile(headerFile, "utf-8");
			if (fileHandle) {
				try {
					await fileHandle.write(`${headerFileContent}`);
				} catch (error) {
					logger.warn(`Error writing header to file: ${error}`);
				}
			}
		} else {
			logger.warn(`Header file not found: ${headerFile}; skipping`);
		}
	} else {
		logger.info("No header file specified");
	}
}

async function processTailFile(
	fileHandle: fs.FileHandle | undefined,
): Promise<void> {
	const tailFile = validateConfig().tail;
	if (tailFile) {
		logger.verbose(`Processing tail file: ${tailFile}`);
		if (existsSync(tailFile)) {
			const tailFileContent = await fs.readFile(tailFile, "utf-8");
			if (fileHandle) {
				try {
					await fileHandle.write(`${tailFileContent}`);
				} catch (error) {
					logger.warn(`Error writing tail to file: ${error}`);
				}
			}
		} else {
			logger.warn(`Tail file not found: ${tailFile}; skipping`);
		}
	} else {
		logger.info("No tail file specified");
	}
}

/**
 * Reads the documentation content from a '.bru' file.
 *
 * @param fileName - The path to the '.bru' file to read the documentation content from.
 * @returns A Promise that resolves to the documentation content if found, or `undefined` if not found.
 */
async function readBruFileDocContent(
	fileName: string,
): Promise<string | undefined> {
	const content = await fs.readFile(fileName, "utf-8");
	const docContent = content.match(/docs \{([^}]*)\}/);
	if (!docContent) {
		const metaData = getMetaData(content, fileName);
		if (!metaData) return;

		const endpointName = getEndpointName(metaData);
		if (!endpointName) return;
		return missingDocumentationContent(endpointName);
	}
	return docContent[1];
}

/**
 * Validates the application configuration and returns it. If the configuration is not initialized, logs an error and exits the process.
 *
 * @returns The validated application configuration.
 */
export function validateConfig(): Config {
	if (globalThis.config) return globalThis.config;
	logger.error("Config is not initialized");
	process.exit(1);
}
