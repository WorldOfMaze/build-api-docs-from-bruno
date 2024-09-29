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
exports.getBruFiles = getBruFiles;
exports.processBruFile = processBruFile;
exports.readBruFileDocContent = readBruFileDocContent;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const node_process_1 = require("node:process");
function combineDocumentation(sourceFilePath, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield getBruFiles(sourceFilePath);
        if (!files || files.length === 0) {
            console.log("No files found");
            (0, node_process_1.exit)(0);
        }
        // Delete the output file if it exists
        yield (0, promises_1.unlink)(destination);
        // Create the output file and get the writer
        const outFile = Bun.file(destination);
        const writer = outFile.writer();
        if (!files) {
            console.log("No files found");
            (0, node_process_1.exit)(0);
        }
        else {
            for (let ndx = 0; ndx < files.length; ndx++) {
                if (files[ndx]) {
                    processBruFile(files[ndx], writer);
                }
            }
        }
        // Close the file
        writer.end();
    });
}
/**
 * Retrieves a list of files with the ".bru" extension from the specified source path.
 *
 * @param sourcePath - The path to the folder to retrieve the ".bru" files from.
 * @returns A Promise that resolves to an array of file paths for the ".bru" files within the folder and its subdirectories.
 */
function getBruFiles(sourcePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getFolderItems(sourcePath)
            .then((files) => files.filter((file) => file.endsWith(".bru")))
            .catch((error) => {
            console.error(error);
            (0, node_process_1.exit)(1);
        });
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
        const folderEntities = (yield (0, promises_1.readdir)(folderPath, {
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
function getMetaData(fileContent) {
    const metaData = fileContent.match(/meta \{([^}]*)\}/);
    if (!metaData) {
        console.log("  Meta section is required to be a valid Bru file; skipping");
        return;
    }
    return "";
}
/**
 * Retrieves the name of the endpoint from the metadata section of a ".bru" file.
 *
 * @param metaData - The metadata section of the ".bru" file content.
 * @returns The name of the endpoint, or `undefined` if the name is not found or is empty.
 */
function getEndpointName(metaData) {
    var _a;
    const name = (_a = metaData[1]) === null || _a === void 0 ? void 0 : _a.match(/name:\s*(.*)/);
    if (!name || name[1] === "") {
        console.log("  A name is required to be a valid Bru file; skipping");
        return;
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

# ${fileName[1]}

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
function processBruFile(fileName, writer) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpointDocumentation = yield readBruFileDocContent(fileName);
        if (endpointDocumentation) {
            writer.write(endpointDocumentation);
            writer.write("\n\n");
            writer.flush();
        }
    });
}
/**
 * Reads the content of a ".bru" file and extracts the documentation section.
 *
 * @param file - The path to the ".bru" file to read.
 * @returns The documentation content from the ".bru" file, or a message indicating the file is not valid.
 */
function readBruFileDocContent(file) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Processing '${file}'...`);
        if (!file) {
            console.log("  File is not valid; skipping");
            return;
        }
        const content = yield Bun.file(file).text();
        const docContent = content.match(/docs \{([^}]*)\}/);
        if (docContent === null) {
            const metaData = getMetaData(content);
            if (!metaData)
                return;
            const name = getEndpointName(metaData);
            if (!name)
                return;
            return missingDocumentationContent(name[1]);
        }
        return docContent[1];
    });
}