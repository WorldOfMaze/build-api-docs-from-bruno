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
exports.getConfig = getConfig;
exports.initConfigFile = initConfigFile;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const logger_1 = require("./logger");
const schema_1 = require("./schema");
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
 * This function retrieves a list of ".bru" files from the specified source path, and then processes each file to combine their documentation into a single output file. If the output file already exists, it is deleted before the new file is created.
 *
 * @param argv - The command-line arguments passed to the application.
 * @returns A Promise that resolves when the documentation has been combined.
 * @throws {Error} If an error occurs while processing the ".bru" files or creating the output file.
 */
function combineDocumentation(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield getConfig(argv);
        try {
            const files = yield getBruFiles(config.source);
            if (!files || files.length === 0) {
                logger_1.logger.warn('No files found');
                return;
            }
            // Delete the output file if it exists
            if (!config.test) {
                try {
                    yield node_fs_1.promises.unlink(config.destination);
                }
                catch (error) {
                    // Ignore if the file doesn't exist
                }
            }
            // Create the output file and get the writer
            // TODO: Check to see if the file exists and warn user before overwriting
            let outFileHandle = undefined;
            if (!config.test) {
                try {
                    const dirName = node_path_1.default.dirname(config.destination);
                    yield node_fs_1.promises.mkdir(dirName, { recursive: true });
                    outFileHandle = yield node_fs_1.promises.open(config.destination, 'w');
                }
                catch (error) {
                    logger_1.logger.error(error);
                    process.exit(1);
                }
            }
            for (let ndx = 0; ndx < files.length; ndx++) {
                if (files[ndx]) {
                    yield processBruFile(files[ndx], outFileHandle, config.logOptions);
                }
            }
            if (outFileHandle) {
                yield outFileHandle.close();
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw 'An unknown error occurred';
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
            const files = yield getFolderItems(node_path_1.default.join(__dirname, '..', sourcePath));
            return files.filter(file => file.endsWith('.bru'));
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
 * Retrieves the application configuration from a configuration file or the global scope.
 *
 * This function first checks if the configuration is already available in the global scope (`globalThis.config`). If so, it returns that configuration.
 *
 * If the configuration is not available in the global scope, the function attempts to read the configuration from a file. The file path is determined based on the provided command-line arguments or a default value. If the configuration file is found, the function reads and parses the file contents as JSON, and validates the configuration against a schema.
 *
 * If the configuration file is not found or the configuration is invalid, the function sets the configuration to default values and overrides them with any command-line arguments provided.
 *
 * Finally, the function stores the final configuration in the global scope (`globalThis.config`) and returns it.
 *
 * @param argv - The command-line arguments passed to the application.
 * @returns A Promise that resolves to the application configuration.
 */
function getConfig(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        //return the config from the globalThis if it exists
        // @ts-expect-error
        if (globalThis.config) {
            // @ts-expect-error
            return globalThis.config;
        }
        let configData;
        // read the config file if it exists
        const configFileName = String(argv['config-file'] || constants_1.DEFAULT_CONFIG_FILE_NAME);
        const configFileNameWithPath = node_path_1.default.join(node_path_1.default.dirname(String(process.argv[1])), '..', configFileName);
        const isExistingConfigFile = yield configFileExists(configFileNameWithPath);
        if (isExistingConfigFile) {
            configData = yield node_fs_1.promises.readFile(configFileName, 'utf-8');
        }
        else {
            configData = yield node_fs_1.promises.readFile(constants_1.DEFAULT_DEFAULT_CONFIG_FILE_NAME, 'utf-8');
        }
        const config = JSON.parse(configData);
        // validate the config
        const res = schema_1.configSchema.safeParse(config);
        if (!res.success) {
            const errors = res.error.errors;
            errors.map(error => {
                if (error.code === 'unrecognized_keys') {
                    logger_1.logger.warn(`${error.message}: ${error.keys.join()}`);
                }
                else if (error.code === 'invalid_type') {
                    logger_1.logger.warn(`${error.path} is ${error.message.toLowerCase()}`);
                }
                else {
                    logger_1.logger.error(error);
                }
            });
            return false;
        }
        // config file is valid; check for any missing configuration files and set to defaults
        if (!config.excludes)
            config.excludes = constants_1.DEFAULT_EXCLUDES;
        if (!config.force)
            config.force = constants_1.DEFAULT_FORCE;
        // TODO: Check to see if header.md file exists and set config.header if it does
        if (!config.logOptions.silent)
            config.logOptions.silent = constants_1.DEFAULT_SILENT;
        if (!config.logOptions.verbose)
            config.logOptions.verbose = constants_1.DEFAULT_VERBOSE;
        // TODO: Check to see if tail.md file exists and set config.tail if it does
        if (!config.test)
            config.test = constants_1.DEFAULT_TEST;
        // now check command line argument and override config as needed
        if (argv.destination)
            config.destination = argv.destination;
        if (argv.force)
            config.force = argv.force;
        if (argv.header)
            config.header = argv.header;
        if (argv.silent)
            config.silent = argv.silent;
        if (argv.source)
            config.logOptions.source = argv.source;
        if (argv.tail)
            config.tail = argv.tail;
        if (argv.test)
            config.test = argv.test;
        if (argv.verbose)
            config.logOptions.verbose = argv.verbose;
        // biome-ignore lint/suspicious/noExplicitAny: Unable to correctly type globalThis
        globalThis.config = config;
        return config;
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
        const files = yield Promise.all(folderEntities.map(entity => {
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
 * @returns The metadata section from the ".bru" file content, or `undefined` if the metadata section is not found.
 */
function getMetaData(fileContent, fileName, options) {
    const metaData = fileContent.match(/meta \{([^}]*)\}/);
    if (!metaData) {
        if (!options.silent)
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
    if (!name || name[1] === '') {
        logger_1.logger.warn('A name is required to be a valid .bru file; skipping');
        return;
    }
    return name[1];
}
/**
 * Initializes a configuration file for the documentation build process.
 *
 * @param configFileName - The name of the configuration file to create.
 * @param force - If true, overwrites the existing configuration file.
 * @param silent - If true, suppresses logging output.
 * @param verbose - If true, enables verbose logging.
 */
function initConfigFile(_a) {
    return __awaiter(this, arguments, void 0, function* ({ configFileName, force, }) {
        if (yield configFileExists(configFileName)) {
            if (force) {
                logger_1.logger.warn(`The configuration file already exists at '${configFileName}' and has been deleted so a new documentation file created.`);
                yield node_fs_1.promises.unlink(configFileName);
            }
            else {
                logger_1.logger.warn(`The configuration file already exists at ${configFileName} and will not be overwritten; use --force to overwrite the existing file.`);
                return;
            }
        }
        try {
            yield node_fs_1.promises.copyFile(constants_1.DEFAULT_CONFIG_FILE_NAME, configFileName, force ? 0 : node_fs_1.promises.constants.COPYFILE_EXCL);
            logger_1.logger.info(`The configuration file has been initialized at ${configFileName}\n You can now edit it to configure the documentation build process.`);
        }
        catch (error) {
            if (error instanceof Error) {
                if ('code' in error && error.code === 'EEXIST') {
                    logger_1.logger.warn(`The configuration file already exists at ${configFileName} and will not be overwritten; use --force to overwrite the existing file.`);
                }
                else {
                    logger_1.logger.error(`An error occurred while initializing the configuration file`);
                    logger_1.logger.error(error);
                }
            }
            else {
                logger_1.logger.info(`The configuration file has been initialized at ${configFileName} and can now edited to configure the documentation build process.`);
            }
        }
    });
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
 * Processes a ".bru" file by reading its documentation content and writing it to a file sink.
 *
 * @param fileName - The path to the ".bru" file to process.
 * @param writer - The file sink to write the documentation content to.
 * @returns A Promise that resolves when the file has been processed.
 */
function processBruFile(fileName, fileHandle, options) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.verbose(`Processing '${fileName}'`);
        const endpointDocumentation = yield readBruFileDocContent(fileName, options);
        if (fileHandle && endpointDocumentation) {
            yield fileHandle.write(`${endpointDocumentation}\n\n`);
        }
    });
}
/**
 * Reads the content of a ".bru" file and extracts the documentation section.
 *
 * @param fileName - The path to the ".bru" file to read.
 * @returns The documentation content from the ".bru" file, or a message indicating the file is not valid.
 */
function readBruFileDocContent(fileName, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield node_fs_1.promises.readFile(fileName, 'utf-8');
        const docContent = content.match(/docs \{([^}]*)\}/);
        if (!docContent) {
            const metaData = getMetaData(content, fileName, options);
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
