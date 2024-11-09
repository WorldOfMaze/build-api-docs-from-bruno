"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configFileExists = configFileExists;
exports.combineDocumentation = combineDocumentation;
exports.exhaustiveSwitchGuard = exhaustiveSwitchGuard;
exports.getBruFiles = getBruFiles;
exports.getFolderItems = getFolderItems;
exports.getMetaData = getMetaData;
exports.getEndpointName = getEndpointName;
exports.missingDocumentationContent = missingDocumentationContent;
exports.processBruFile = processBruFile;
exports.processHeaderFile = processHeaderFile;
exports.processTailFile = processTailFile;
exports.readBruFileDocContent = readBruFileDocContent;
exports.validateConfig = validateConfig;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const inquirer_1 = require("./inquirer");
const logger_1 = require("./logger");
/**
 * Checks if a configuration file exists and is readable.
 *
 * @param configFileName - The path to the configuration file to check.
 * @returns A Promise that resolves to `true` if the configuration file exists and is readable, `false` otherwise.
 * @throws {Error} If an error occurs while checking the file.
 */
function configFileExists(configFileName) {
    try {
        (0, node_fs_1.accessSync)(configFileName, node_fs_1.promises.constants.R_OK);
        return true;
    }
    catch (error) {
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
function combineDocumentation() {
    return __awaiter(this, arguments, void 0, function* (validateConfigFn = validateConfig, getBruFilesFn = getBruFiles, existsSyncFn = node_fs_1.existsSync, dirnameFn = node_path_1.default.dirname, mkdirSyncFn = node_fs_1.mkdirSync, openSyncFn = node_fs_1.openSync, processHeaderFileFn = processHeaderFile, processBruFileFn = processBruFile, processTailFileFn = processTailFile, closeFn = node_fs_1.close) {
        const config = validateConfigFn();
        try {
            const files = getBruFilesFn(config.source);
            if (!files || files.length === 0) {
                logger_1.logger.warn("No Bruno files found");
                return;
            }
            let outFileHandle = undefined;
            try {
                if (!globalThis.testMode) {
                    if (existsSyncFn(config.destination) &&
                        !(config === null || config === void 0 ? void 0 : config.force) &&
                        !(config === null || config === void 0 ? void 0 : config.logOptions.silent)) {
                        const overwrite = yield (0, inquirer_1.confirmOverwriteDocs)();
                        if (overwrite) {
                            (0, node_fs_1.unlinkSync)(config.destination);
                        }
                        else {
                            logger_1.logger.info("User has chosen to not overwrite existing file");
                            process.exit(0);
                        }
                    }
                    const dirName = dirnameFn(config.destination);
                    mkdirSyncFn(dirName, { recursive: true });
                    outFileHandle = openSyncFn(config.destination, "w");
                    processHeaderFileFn(outFileHandle);
                    for (let ndx = 0; ndx < files.length; ndx++) {
                        if (files[ndx]) {
                            processBruFileFn(files[ndx], outFileHandle);
                        }
                    }
                    processTailFileFn(outFileHandle);
                    closeFn(outFileHandle);
                }
            }
            catch (error) {
                logger_1.logger.error(error);
                process.exit(1);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("An unknown error occurred");
        }
    });
}
/**
 * Throws an error with the provided message if the `value` parameter is not of type `never`.
 * This function is intended to be used as a guard in exhaustive switch statements to ensure all possible cases are handled.
 *
 * @param value - The value to check. This should be of type `never` if the switch statement is exhaustive.
 * @param message - The error message to throw if `value` is not of type `never`. Defaults to a generic message.
 * @throws {Error} If `value` is not of type `never`.
 */
function exhaustiveSwitchGuard(value, message = `Unhandled value in switch statement: ${value}.`) {
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
function getBruFiles(sourcePath, getFolderItemsFn = getFolderItems) {
    try {
        const files = getFolderItemsFn(node_path_1.default.join(__dirname, "..", sourcePath));
        return files.filter((file) => file.endsWith(".bru"));
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.logger.warn(`Source path '${sourcePath}' does not exist`);
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
function getFolderItems(folderPath) {
    const folderEntities = (0, node_fs_1.readdirSync)(folderPath, {
        withFileTypes: true,
    });
    const fileNames = folderEntities
        .filter((entity) => entity.isFile())
        .map((file) => file.name);
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
function getMetaData(fileContent, fileName, validateConfigFn = validateConfig) {
    const metaData = fileContent.match(/meta \{([^}]*)\}/);
    const config = validateConfigFn();
    if (!metaData) {
        if (!config.logOptions.silent)
            logger_1.logger.warn(`${fileName}: Meta section is required to be a valid .bru file; skipping`);
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
function getEndpointName(metaData) {
    const name = metaData.match(/.*name:\s*(.*)/i);
    if (!name || name[1] === "") {
        logger_1.logger.warn("A name is required to be a valid .bru file; skipping");
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
function missingDocumentationContent(fileName) {
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
function processBruFile(fileName, fileHandle, validateConfigFn = validateConfig, readBruFileDocContentFn = readBruFileDocContent, writeSyncFn = node_fs_1.writeSync) {
    var _a;
    const config = validateConfigFn();
    if ((_a = config.excludes) === null || _a === void 0 ? void 0 : _a.includes(node_path_1.default.basename(fileName))) {
        logger_1.logger.verbose(`'${fileName}' is in the exclude list; skipping`);
    }
    else {
        logger_1.logger.verbose(`Processing '${fileName}'`);
        const endpointDocumentation = readBruFileDocContentFn(fileName);
        if (endpointDocumentation) {
            writeSyncFn(fileHandle, `${endpointDocumentation}`);
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
function processHeaderFile(fileHandle, validateConfigFn = validateConfig, existsSyncFn = node_fs_1.existsSync, readFileSyncFn = node_fs_1.readFileSync, writeSyncFn = node_fs_1.writeSync) {
    const headerFile = validateConfigFn().header;
    if (headerFile) {
        logger_1.logger.verbose(`Processing header file: ${headerFile}`);
        if (existsSyncFn(headerFile)) {
            const headerFileContent = readFileSyncFn(headerFile, "utf-8");
            try {
                writeSyncFn(fileHandle, `${headerFileContent}`);
            }
            catch (error) {
                logger_1.logger.warn(`Error writing header to file: ${error}`);
            }
        }
        else {
            logger_1.logger.warn(`Header file not found: ${headerFile}; skipping`);
        }
    }
    else {
        logger_1.logger.info("No header file specified");
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
function processTailFile(fileHandle, validateConfigFn = validateConfig, existsSyncFn = node_fs_1.existsSync, readFileSyncFn = node_fs_1.readFileSync, writeSyncFn = node_fs_1.writeSync) {
    const tailFile = validateConfigFn().tail;
    if (tailFile) {
        logger_1.logger.verbose(`Processing tail file: ${tailFile}`);
        if (existsSyncFn(tailFile)) {
            const tailFileContent = readFileSyncFn(tailFile, "utf-8");
            if (fileHandle) {
                try {
                    writeSyncFn(fileHandle, `${tailFileContent}`);
                }
                catch (error) {
                    logger_1.logger.warn(`Error writing tail to file: ${error}`);
                }
            }
        }
        else {
            logger_1.logger.warn(`Tail file not found: ${tailFile}; skipping`);
        }
    }
    else {
        logger_1.logger.info("No tail file specified");
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
function readBruFileDocContent(fileName, readFileSyncFn = node_fs_1.readFileSync, getMetaDataFn = getMetaData, getEndpointNameFn = getEndpointName, missingDocumentationContentFn = missingDocumentationContent) {
    const content = readFileSyncFn(fileName, "utf-8");
    const docContent = content.match(/docs \{([^}]*)\}/);
    if (!docContent) {
        const metaData = getMetaDataFn(content, fileName);
        if (!metaData)
            return;
        const endpointName = getEndpointNameFn(metaData);
        if (!endpointName)
            return;
        return missingDocumentationContentFn(endpointName);
    }
    return docContent[1];
}
/**
 * Validates the application configuration and returns it. If the configuration is not initialized, logs an error and exits the process.
 *
 * @returns The validated application configuration.
 */
function validateConfig() {
    if (globalThis.config)
        return globalThis.config;
    logger_1.logger.error("Config is not initialized");
    process.exit(1);
}
//# sourceMappingURL=utils.js.map