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
exports.combineDocumentation = combineDocumentation;
exports.exhaustiveSwitchGuard = exhaustiveSwitchGuard;
exports.initConfigFile = initConfigFile;
exports.log = log;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const Log = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    // Foreground (text) colors
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        crimson: "\x1b[38m",
    },
    // Background colors
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        crimson: "\x1b[48m",
    },
};
/**
 * Combines the documentation from multiple ".bru" files into a single output file.
 *
 * @param sourceFilePath - The path to the folder containing the ".bru" files.
 * @param destination - The path to the output file where the combined documentation will be written.
 * @param options - Optional build options, including a `test` flag to skip writing the output file.
 * @returns A Promise that resolves when the documentation has been combined.
 * @throws {Error} If the source path does not exist or an error occurs during the process.
 */
function combineDocumentation(sourceFilePath_1, destination_1) {
    return __awaiter(this, arguments, void 0, function* (sourceFilePath, destination, options = {
        test: false,
        verbose: true,
        silent: false,
    }) {
        const { test, silent } = options;
        try {
            const files = yield getBruFiles(sourceFilePath);
            if (!files || files.length === 0) {
                if (!silent)
                    console.log("No files found");
                return;
            }
            // Delete the output file if it exists
            if (!test) {
                try {
                    yield node_fs_1.promises.unlink(destination);
                }
                catch (error) {
                    // Ignore if the file doesn't exist
                }
            }
            // Create the output file and get the writer
            let outFileHandle = undefined;
            if (!test) {
                outFileHandle = yield node_fs_1.promises.open(destination, "w");
            }
            for (let ndx = 0; ndx < files.length; ndx++) {
                if (files[ndx]) {
                    yield processBruFile(files[ndx], outFileHandle, options);
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
            const files = yield getFolderItems(sourcePath);
            return files.filter((file) => file.endsWith(".bru"));
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Source path '${sourcePath}' does not exist`);
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
 * @returns The metadata section from the ".bru" file content, or `undefined` if the metadata section is not found.
 */
function getMetaData(fileContent, options) {
    const { silent } = options;
    const metaData = fileContent.match(/meta \{([^}]*)\}/);
    if (!metaData) {
        if (!silent)
            console.log("  Meta section is required to be a valid Bru file; skipping");
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
function getEndpointName(metaData, options) {
    const { silent } = options;
    const name = metaData.match(/.*name:\s*(.*)/i);
    if (!name || name[1] === "") {
        if (!silent)
            console.log("  A name is required to be a valid Bru file; skipping");
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
    return __awaiter(this, arguments, void 0, function* ({ configFileName, force, silent, verbose, }) {
        const logOptions = {
            silent: silent || false,
            verbose: verbose || false,
        };
        try {
            yield node_fs_1.promises.copyFile(constants_1.DEFAULT_CONFIG_FILE_NAME, configFileName, force ? 0 : node_fs_1.promises.constants.COPYFILE_EXCL);
            log("info", `The configuration file has been initialized at ${configFileName}\n You can now edit it to configure the documentation build process.\n`, logOptions);
        }
        catch (error) {
            if (error instanceof Error) {
                if ("code" in error && error.code === "EEXIST") {
                    log("warn", `The configuration file already exists at ${configFileName}; skipping.\n Use --force to overwrite the existing file.\n`, logOptions);
                }
                else {
                    log("error", `An error occurred while initializing the configuration file: ${error.message}`, logOptions);
                }
            }
            else {
                log("info", `The configuration file has been initialized at ${configFileName}\n You can now edit it to configure the documentation build process.\n`, logOptions);
            }
        }
    });
}
/**
 * Logs a message to the console with the specified log level and options.
 *
 * @param level - The log level to use for the message.
 * @param message - The message to log.
 * @param options - Options that control the logging behavior.
 */
function log(level, message, options) {
    switch (level) {
        case "error":
            if (!options.silent)
                console.error(Log.fg.red, message);
            break;
        case "warn":
            if (!options.silent)
                console.error(Log.fg.yellow, message);
            break;
        case "info":
            if (!options.silent)
                console.error(Log.fg.white, message);
            break;
        case "verbose":
            if (options.verbose)
                console.error(Log.fg.white, message);
            break;
        case "debug":
            if (!options.silent)
                console.error(Log.fg.white, message);
            break;
        default:
            exhaustiveSwitchGuard(level);
    }
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
        const { verbose } = options;
        if (verbose)
            console.log(`Processing '${fileName}...'`);
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
        const content = yield node_fs_1.promises.readFile(fileName, "utf-8");
        const docContent = content.match(/docs \{([^}]*)\}/);
        if (!docContent) {
            const metaData = getMetaData(content, options);
            if (!metaData)
                return;
            const endpointName = getEndpointName(metaData, options);
            if (!endpointName)
                return;
            return missingDocumentationContent(endpointName);
        }
        return docContent[1];
    });
}
