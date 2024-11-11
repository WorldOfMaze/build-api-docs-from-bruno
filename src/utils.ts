import {
	accessSync,
	close,
	existsSync,
	promises as fs,
	mkdirSync,
	openSync,
	readFileSync,
	readdirSync,
	unlinkSync,
	writeSync,
	type Dirent,
} from "node:fs";
import path from "node:path";
import type { Config } from "../types.ts";
import { confirmOverwriteDocs } from "./inquirer";
import { logger } from "./logger";

/**
 * Checks if a configuration file exists and is readable.
 *
 * @param configFileName - The path to the configuration file to check.
 * @returns A Promise that resolves to `true` if the configuration file exists and is readable, `false` otherwise.
 * @throws {Error} If an error occurs while checking the file.
 */
export function configFileExists(configFileName: string): boolean {
	try {
		accessSync(configFileName, fs.constants.R_OK);
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
export async function combineDocumentation(
	validateConfigFn = validateConfig,
	getBruFilesFn = getBruFiles,
	existsSyncFn = existsSync,
	dirnameFn = path.dirname,
	mkdirSyncFn = mkdirSync,
	openSyncFn = openSync,
	processHeaderFileFn = processHeaderFile,
	processBruFileFn = processBruFile,
	processTailFileFn = processTailFile,
	closeFn = close,
	confirmOverwriteDocsFn = confirmOverwriteDocs,
	unlinkSyncFn = unlinkSync,
): Promise<void> {
	const config = validateConfigFn();
	const destination = path.join(process.cwd(), config.destination);
	const source = path.join(process.cwd(), config.source);

	logger?.verbose(`Destination: ${destination}`);
	logger?.verbose(`Source: ${source}`);

	try {
		const files = getBruFilesFn(source);
		if (!files || files.length === 0) {
			logger?.warn("No Bruno files found");
			return;
		}
		logger?.debug("The following files will be combined:");
		files.map((file) => logger?.debug(`- ${file}`));

		let outFileHandle: number | undefined = 0;
		if (!globalThis.testMode) {
			if (existsSyncFn(destination)) {
				logger?.verbose(`Documentation file already exists at ${destination}`);
				if (config.force || config.logOptions.silent) {
					logger?.verbose(
						`${config.force ? "Force mode is enabled; " : ""} ${config.logOptions.silent ? "Silent mode is enabled; " : ""}overwriting existing file`,
					);
					unlinkSyncFn(destination);
				} else {
					if (await confirmOverwriteDocsFn()) {
						unlinkSyncFn(destination);
					} else {
						logger?.info(
							"User has chosen to not overwrite existing file; exiting",
						);
						process.exit(0);
					}
				}
			}
		}
		const dirName = dirnameFn(destination);
		if (!globalThis.testMode) {
			mkdirSyncFn(dirName, { recursive: true });
			outFileHandle = openSyncFn(destination, "w");
			logger?.debug(
				`Opened file handle ${outFileHandle} for output file: ${destination}`,
			);
		}
		processHeaderFileFn(outFileHandle);
		for (let ndx = 0; ndx < files.length; ndx++) {
			if (files[ndx]) {
				processBruFileFn(files[ndx], outFileHandle);
			}
		}
		processTailFileFn(outFileHandle);
		if (!globalThis.testMode) {
			closeFn(outFileHandle);
		}
	} catch (error) {
		logger?.error(error);
		console.error(
			"An error occurred while processing the Bruno files; see log for details",
		);
		process.exit(1);
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
 * Retrieves all files with the `.bru` extension from a specified source path.
 *
 * @param {string} sourcePath - The path from which to retrieve the `.bru` files. This path is relative to the directory containing the function.
 * @param {Function} [getFolderItemsFn=getFolderItems] - An optional function to retrieve items from a folder. This defaults to the `getFolderItems` function if not provided.  This parameter is intended for testing purposes and should not be provided for normal use.
 * @returns {string[]} - An array of file names with the `.bru` extension found in the specified source path.
 * @throws {Error} - Rethrows any error encountered during folder item retrieval if it's not an instance of `Error`.
 *                   Logs a warning and exits the process if the specified source path does not exist.
 *
 * @example
 * const bruFiles = getBruFiles('path/to/source');
 * console.log(bruFiles);
 * // Output might be: ['test1.bru', 'test3.bru']
 */
export function getBruFiles(
	sourcePath: string,
	getFolderItemsFn = getFolderItems,
) {
	logger?.debug(`Getting .bru files from ${sourcePath}`);
	try {
		const files = getFolderItemsFn(sourcePath);
		logger?.debug(`Found ${files.length} items in ${sourcePath}`);
		files.map((file) => logger?.debug(`- ${file}`));
		const fileList = files.filter((file) => {
			logger?.debug(`Checking file ${file}`);
			return file.endsWith(".bru");
		});
		logger?.debug(`Found ${fileList.length} .bru files`);
		fileList.map((file) => logger?.debug(`- ${file}`));
		return fileList;
	} catch (error) {
		if (error instanceof Error) {
			logger?.warn(`Source path '${sourcePath}' does not exist`);
			process.exit(1);
		}
		throw error;
	}
}

/**
 * Retrieves a list of file names from the specified folder path.
 *
 * @param folderPath - The path to the folder to retrieve the file names from.
 * @returns An array of file names in the specified folder.
 */
// TODO: make this recursive
export function getFolderItems(folderPath: string): string[] {
	logger?.debug(`Getting items from ${folderPath}`);
	const folderEntities = readdirSync(folderPath, {
		withFileTypes: true,
	}) as Dirent[];

	let fileNames: string[] = [];

	for (const entity of folderEntities) {
		if (entity.isFile()) {
			const fileWithPath = path.join(folderPath, entity.name);
			logger?.debug(`- ${fileWithPath}`);
			fileNames.push(fileWithPath);
		} else if (entity.isDirectory()) {
			const subFolderPath = path.join(folderPath, entity.name);
			logger?.debug(`Recursively getting items from ${subFolderPath}`);
			fileNames = fileNames.concat(getFolderItems(subFolderPath));
		}
	}

	logger?.debug("The following files were found:");
	fileNames.map((file) => logger?.debug(`- ${file}`));
	return fileNames;
}

/**
 * Extracts metadata from the file content if present and logs a warning if the meta section is missing.
 *
 * @param {string} fileContent - The content of the file to extract metadata from
 * @param {string} fileName - The name of the file being processed.
 * @param {Function} [validateConfigFn=validateConfig] - An optional function to validate the configuration. Defaults to `validateConfig` if not provided. This parameter is intended for testing purposes and should not be provided for normal use.
 * @returns {string | undefined} - The extracted metadata if present, otherwise `undefined`.
 * @throws {Error} - Rethrows any error encountered during configuration validation.
 *
 * @example
 * const fileContent = "Some content meta {metadata content} more content";
 * const fileName = "example.bru";
 * const metadata = getMetaData(fileContent, fileName);
 * console.log(metadata); // Output: "metadata content"
 * */
export function getMetaData(
	fileContent: string,
	fileName: string,
	validateConfigFn = validateConfig,
): string | undefined {
	const metaData = fileContent.match(/meta \{([^}]*)\}/);
	const config = validateConfigFn();
	if (!metaData) {
		if (!config.logOptions.silent)
			logger?.warn(
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
export function getEndpointName(metaData: string): string | undefined {
	const name = metaData.match(/.*name:\s*(.*)/i);
	if (!name || name[1] === "") {
		logger?.warn("A name is required to be a valid .bru file; skipping");
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
export function missingDocumentationContent(fileName: string): string {
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
export function processBruFile(
	fileName: string,
	fileHandle: number,
	validateConfigFn = validateConfig,
	readBruFileDocContentFn = readBruFileDocContent,
	writeSyncFn = writeSync,
): void {
	const config = validateConfigFn();
	if (config.excludes?.includes(path.basename(fileName))) {
		logger?.verbose(`'${fileName}' is in the exclude list; skipping`);
	} else {
		try {
			logger?.verbose(`Processing '${fileName}'`);
			const endpointDocumentation = readBruFileDocContentFn(fileName);
			if (endpointDocumentation) {
				if (!globalThis.testMode) {
					writeSyncFn(fileHandle, `${endpointDocumentation}`);
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				logger?.error(`Error processing '${fileName}': ${error.message}`);
			}
			logger?.error(`Error processing '${fileName}': ${error}`);
		}
	}
}

/**
 *  Processes the header file by validating the configuration, checking if the header file exists, reading its content,  writing it to the provided file handle.
 *
 *  @param fileHandle - The file handle to write the header content to.
 *  @param  validateConfigFn - The function to validate the configuration.  This parameter is intended for testing purposes and should not be provided for normal use.
 *  @param  existsSyncFn - The function to check if the file exists. This parameter is intended for testing purposes and should not be provided for normal use.
 *  @param  readFileSyncFn - The function to read the file content. This parameter is intended for testing purposes and should not be provided for normal use.
 *  @param  writeSyncFn - The function to write the content to the file handle. This parameter is intended for testing purposes and should not be provided for normal use.
 */
export function processHeaderFile(
	fileHandle: number,
	validateConfigFn = validateConfig,
	existsSyncFn = existsSync,
	readFileSyncFn = readFileSync,
	writeSyncFn = writeSync,
): void {
	const headerFile = validateConfigFn().header;
	if (headerFile) {
		logger?.verbose(
			`Processing header file: ${path.join(process.cwd(), headerFile)}`,
		);
		if (existsSyncFn(headerFile)) {
			const headerFileContent = readFileSyncFn(
				path.join(process.cwd(), headerFile),
				"utf-8",
			);
			try {
				if (!globalThis.testMode) {
					writeSyncFn(fileHandle, `${headerFileContent}`);
				}
			} catch (error) {
				logger?.warn(`Error writing header to file: ${error}`);
			}
		} else {
			logger?.warn(`Header file not found: ${headerFile}; skipping`);
		}
	} else {
		logger?.verbose("No header file specified");
	}
}

/**
 *  Processes the tail file by validating the configuration, checking if the tail file exists, reading its content,  writing it to the provided file handle.
 *
 *  @param fileHandle - The file handle to write the header content to.
 *  @param  validateConfigFn - The function to validate the configuration.  This parameter is intended for testing purposes and should not be provided for normal use.
 *  @param  existsSyncFn - The function to check if the file exists. This parameter is intended for testing purposes and should not be provided for normal use.
 *  @param  readFileSyncFn - The function to read the file content. This parameter is intended for testing purposes and should not be provided for normal use.
 *  @param  writeSyncFn - The function to write the content to the file handle. This parameter is intended for testing purposes and should not be provided for normal use.
 */
export function processTailFile(
	fileHandle: number,
	validateConfigFn = validateConfig,
	existsSyncFn = existsSync,
	readFileSyncFn = readFileSync,
	writeSyncFn = writeSync,
): void {
	const tailFile = validateConfigFn().tail;
	if (tailFile) {
		logger?.verbose(
			`Processing tail file: ${path.join(process.cwd(), tailFile)}`,
		);
		if (existsSyncFn(tailFile)) {
			const tailFileContent = readFileSyncFn(
				path.join(process.cwd(), tailFile),
				"utf-8",
			);
			if (fileHandle) {
				try {
					if (!globalThis.testMode) {
						writeSyncFn(fileHandle, `${tailFileContent}`);
					}
				} catch (error) {
					logger?.warn(`Error writing tail to file: ${error}`);
				}
			}
		} else {
			logger?.warn(`Tail file not found: ${tailFile}; skipping`);
		}
	} else {
		logger?.verbose("No tail file specified");
	}
}

/**
 *  Reads the content of a BRU file and extracts the documentation content.
 *  If the documentation content is not found, retrieves metadata and endpoint name,
 *  and returns the missing documentation content.
 *
 *  @param fileName - The name of the file to read.
 *  @param readFileSyncFn - The function to read the file content.
 *  @param  getMetaDataFn - The function to get metadata from the file content.
 *  @param  getEndpointNameFn - The function to get the endpoint name from the metadata.
 *  @param  missingDocumentationContentFn - The function to get the missing documentation content for the endpoint.
 *  @returns  - The extracted documentation content or undefined if not found. */
export function readBruFileDocContent(
	fileName: string,
	readFileSyncFn = readFileSync,
	getMetaDataFn = getMetaData,
	getEndpointNameFn = getEndpointName,
	missingDocumentationContentFn = missingDocumentationContent,
): string | undefined {
	const content = readFileSyncFn(fileName, "utf-8");
	const docContent = content.match(/docs \{([^}]*)\}/);
	if (!docContent) {
		const metaData = getMetaDataFn(content, fileName);
		if (!metaData) return;

		const endpointName = getEndpointNameFn(metaData);
		if (!endpointName) return;
		return missingDocumentationContentFn(endpointName);
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
	logger?.error("Config is not initialized");
	process.exit(1);
}
