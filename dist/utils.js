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
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield node_fs_1.promises.access(configFileName, node_fs_1.promises.constants.R_OK);
            return true;
        }
        catch (error) {
            return false;
        }
    });
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
    return __awaiter(this, void 0, void 0, function* () {
        const config = validateConfig();
        try {
            const files = yield getBruFiles(config.source);
            if (!files || files.length === 0) {
                logger_1.logger.warn("No Bruno files found");
                return;
            }
            let outFileHandle = undefined;
            try {
                if (!globalThis.testMode) {
                    if ((0, node_fs_1.existsSync)(config.destination) &&
                        !(config === null || config === void 0 ? void 0 : config.force) &&
                        !(config === null || config === void 0 ? void 0 : config.logOptions.silent)) {
                        const overwrite = yield (0, inquirer_1.confirmOverwriteDocs)();
                        if (overwrite) {
                            (0, node_fs_1.unlinkSync)(config.destination);
                        }
                        else {
                            logger_1.logger.info("User has chosen to not overwrite existing file");
                            process.exit(1);
                        }
                    }
                    const dirName = node_path_1.default.dirname(config.destination);
                    yield node_fs_1.promises.mkdir(dirName, { recursive: true });
                    outFileHandle = yield node_fs_1.promises.open(config.destination, "w");
                }
            }
            catch (error) {
                logger_1.logger.error(error);
                process.exit(1);
            }
            yield processHeaderFile(outFileHandle);
            for (let ndx = 0; ndx < files.length; ndx++) {
                if (files[ndx]) {
                    yield processBruFile(files[ndx], outFileHandle);
                }
            }
            yield processTailFile(outFileHandle);
            if (outFileHandle) {
                yield outFileHandle.close();
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw "An unknown error occurred";
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
 * Retrieves a list of ".bru" files from the specified source path.
 *
 * @param sourcePath - The path to the folder containing the ".bru" files.
 * @returns A Promise that resolves to an array of file paths for the ".bru" files found in the source path and its subdirectories.
 * @throws {Error} If the source path does not exist.
 */
function getBruFiles(sourcePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield getFolderItems(node_path_1.default.join(__dirname, "..", sourcePath));
            return files.filter((file) => file.endsWith(".bru"));
        }
        catch (error) {
            if (error instanceof Error) {
                logger_1.logger.warn(`Source path '${sourcePath}' does not exist`);
                process.exit(1);
            }
            throw error;
        }
    });
}
/**
 * Retrieves the contents of a folder, recursively traversing any subdirectories.
 *
 * @param folderPath - The path to the folder to retrieve the contents of.
 * @returns A Promise that resolves to an array of file paths within the folder and its subdirectories.
 */
function getFolderItems(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderEntities = (yield node_fs_1.promises.readdir(folderPath, {
            withFileTypes: true,
        }));
        const files = yield Promise.all(folderEntities.map((entity) => {
            const res = node_path_1.default.resolve(folderPath, entity.name);
            return entity.isDirectory() ? getFolderItems(res) : res;
        }));
        return Array.prototype.concat(...files);
    });
}
/**
 * Retrieves the metadata section from the content of a ".bru" file.
 *
 * @param fileContent - The content of the ".bru" file.
 * @param fileName - The name of the ".bru" file.
 * @returns The metadata section as a string, or `undefined` if the metadata section is not found or is empty.
 */
function getMetaData(fileContent, fileName) {
    const metaData = fileContent.match(/meta \{([^}]*)\}/);
    const config = validateConfig();
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
function processBruFile(fileName, fileHandle) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const config = validateConfig();
        if ((_a = config.excludes) === null || _a === void 0 ? void 0 : _a.includes(node_path_1.default.basename(fileName))) {
            logger_1.logger.verbose(`'${fileName}' is in the exclude list; skipping`);
        }
        else {
            logger_1.logger.verbose(`Processing '${fileName}'`);
            const endpointDocumentation = yield readBruFileDocContent(fileName);
            if (fileHandle && endpointDocumentation) {
                yield fileHandle.write(`${endpointDocumentation}`);
            }
        }
    });
}
function processHeaderFile(fileHandle) {
    return __awaiter(this, void 0, void 0, function* () {
        const headerFile = validateConfig().header;
        if (headerFile) {
            logger_1.logger.verbose(`Processing header file: ${headerFile}`);
            if ((0, node_fs_1.existsSync)(headerFile)) {
                const headerFileContent = yield node_fs_1.promises.readFile(headerFile, "utf-8");
                if (fileHandle) {
                    try {
                        yield fileHandle.write(`${headerFileContent}`);
                    }
                    catch (error) {
                        logger_1.logger.warn(`Error writing header to file: ${error}`);
                    }
                }
            }
            else {
                logger_1.logger.warn(`Header file not found: ${headerFile}; skipping`);
            }
        }
        else {
            logger_1.logger.info("No header file specified");
        }
    });
}
function processTailFile(fileHandle) {
    return __awaiter(this, void 0, void 0, function* () {
        const tailFile = validateConfig().tail;
        if (tailFile) {
            logger_1.logger.verbose(`Processing tail file: ${tailFile}`);
            if ((0, node_fs_1.existsSync)(tailFile)) {
                const tailFileContent = yield node_fs_1.promises.readFile(tailFile, "utf-8");
                if (fileHandle) {
                    try {
                        yield fileHandle.write(`${tailFileContent}`);
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
    });
}
/**
 * Reads the documentation content from a '.bru' file.
 *
 * @param fileName - The path to the '.bru' file to read the documentation content from.
 * @returns A Promise that resolves to the documentation content if found, or `undefined` if not found.
 */
function readBruFileDocContent(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield node_fs_1.promises.readFile(fileName, "utf-8");
        const docContent = content.match(/docs \{([^}]*)\}/);
        if (!docContent) {
            const metaData = getMetaData(content, fileName);
            if (!metaData)
                return;
            const endpointName = getEndpointName(metaData);
            if (!endpointName)
                return;
            return missingDocumentationContent(endpointName);
        }
        return docContent[1];
    });
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
