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
exports.confirmBuild = confirmBuild;
exports.confirmOverwriteDocs = confirmOverwriteDocs;
exports.destination = destination;
exports.saveConfig = saveConfig;
exports.source = source;
exports.testMode = testMode;
const prompts_1 = require("@inquirer/prompts");
const node_fs_1 = __importDefault(require("node:fs"));
const logger_1 = require("./logger");
/**
 * Prompts the user to confirm whether they want to continue with the build process, which will overwrite any prior documentation.
 *
 * @returns {Promise<boolean>} `true` if the user confirms they are ready to continue, `false` otherwise.
 */
function confirmBuild() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.confirm)({
            message: "Test completed.  Do you want to build the documentation?",
            default: true,
        });
        logger_1.logger.verbose(`User provided build confirmation: ${answer}`);
        return answer;
    });
}
function confirmOverwriteDocs() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.confirm)({
            message: "A documentation file already exists.  Do you want to overwrite it and create a new set of documentation?",
            default: true,
        });
        logger_1.logger.verbose(`User provided documentation overwrite confirmation: ${answer}`);
        return answer;
    });
}
/**
 * Prompts the user to enter the destination file path for the documentation.
 * The file path must be a valid file name ending in `.md`.
 *
 * @returns {Promise<string>} The user-provided file path for the documentation.
 */
function destination() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.input)({
            message: "Where should the documentation file be saved?",
            default: "documentation/api.md",
            required: true,
            validate: (input) => {
                const regex = /^(?:[\w\-\s]+\/)*[\w\-\s]+\.md$/;
                if (regex.test(input)) {
                    return true;
                }
                return "Invalid file path. Please enter a valid file name ending in .md";
            },
        });
        logger_1.logger.verbose(`User provided destination: ${answer}`);
        return answer;
    });
}
/**
 * Prompts the user to confirm whether they want to save the current options to the configuration file for future use. This will overwrite any existing configuration options.
 *
 * @returns {Promise<boolean>} `true` if the user wants to save the configuration, `false` otherwise.
 */
function saveConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.confirm)({
            message: "Do you want to save these options to the configuration file for future use?  This will overwrite any existing configuration options.",
            default: true,
        });
        logger_1.logger.verbose(`User provided save config: ${answer}`);
        return answer;
    });
}
/**
 * Prompts the user to enter the location of the collection of Bruno files.
 * The file path must be a valid directory that exists on the file system.
 *
 * @returns {Promise<string>} The user-provided file path for the collection of Bruno files.
 */
function source() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.input)({
            message: "Where is the collection of Bruno files?",
            default: "Collections",
            required: true,
            validate: (input) => {
                if (node_fs_1.default.existsSync(input)) {
                    return true;
                }
                return "Invalid file path. Please enter a valid file path.";
            },
        });
        logger_1.logger.verbose(`User provided source: ${answer}`);
        return answer;
    });
}
/**
 * Prompts the user to choose whether to save the documentation or just test the process.
 *
 * @returns {Promise<boolean>} `true` if the user wants to just test the process, `false` if the user wants to save the documentation.
 */
function testMode() {
    return __awaiter(this, void 0, void 0, function* () {
        const answer = yield (0, prompts_1.select)({
            message: "Do you want to save the documentation or just test the process?",
            choices: [
                {
                    name: "Yes, save the documentation",
                    value: false,
                },
                {
                    name: "No, just test the process without writing documentation",
                    value: true,
                },
            ],
        });
        logger_1.logger.verbose(`User provided test mode: ${answer}`);
        return answer;
    });
}
