"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guidedCommand = exports.buildCommand = exports.registeredCommands = exports.commonOptions = void 0;
const config_1 = __importStar(require("./config"));
const inquirer_1 = require("./inquirer");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
exports.commonOptions = {
    configFile: {
        alias: "c",
        type: "string",
        describe: "Optional path to config file.",
        default: "bruno-doc.config.json",
    },
    debug: {
        alias: "D",
        default: false,
        describe: "Log debug information.",
        type: "boolean",
    },
    destination: {
        alias: "d",
        type: "string",
        describe: "The path and name of the output file.",
        default: "./documentation/api.md",
    },
    excludes: {
        alias: "e",
        // array: true,
        describe: "The path and name of one or more exclude file.",
        type: "string",
    },
    force: {
        alias: "f",
        default: false,
        describe: "Overwrite existing data and configuration without asking.",
        type: "boolean",
    },
    header: {
        alias: "H",
        type: "string",
        array: true,
        describe: "The path and name of one or more header file.",
    },
    saveConfig: {
        alias: "S",
        default: true,
        describe: "Save the configuration to a file.",
        type: "boolean",
    },
    silent: {
        alias: "q",
        default: false,
        describe: "Produce no output.",
        type: "boolean",
    },
    source: {
        alias: "s",
        type: "string",
        describe: "Path to folder containing .bru files.",
        default: "Collections",
    },
    tail: {
        alias: "T",
        array: true,
        describe: "The path and name of one or more tail file.",
        type: "string",
    },
    test: {
        alias: "t",
        type: "boolean",
        describe: "Test the documentation build process.",
        default: false,
    },
    verbose: {
        alias: "r",
        type: "boolean",
        describe: "Log extra information.",
        default: false,
    },
};
/**
 * An array that keeps track of all the registered commands in the application.
 */
exports.registeredCommands = [];
/**
 * Builds the API documentation.
 *
 * This command module is responsible for building the API documentation. It uses the `combineDocumentation` function to generate the documentation from the source files and write it to the specified destination file.
 *
 */
exports.buildCommand = {
    command: "go",
    describe: "Builds the API documentation without user input.",
    builder: (yargs) => yargs.strict().help().version(false),
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("UNattended mode\n");
        if (argv.debug) {
            (0, logger_1.setLogLevel)("debug");
        }
        logger_1.logger.debug("Loading configuration...");
        (0, config_1.default)(argv);
        logger_1.logger.debug("Successfully loaded configuration.");
        logger_1.logger.info("Executing 'go' command...");
        if (!globalThis.config) {
            logger_1.logger.error("\nInvalid configuration file; aborting.");
            process.exit(0);
        }
        // globalThis.config.source = await source();
        // globalThis.config.destination = await destination();
        // globalThis.testMode = await testMode();
        if (argv.test) {
            logger_1.logger.warn("Test mode not support in unattended more; skipping.");
        }
        // if (globalThis.testMode) {
        // 	logger.info("Testing build process\n");
        // 	try {
        // 		await combineDocumentation();
        // 		logger.verbose("Test complete.");
        // 		globalThis.testMode = false;
        // 		globalThis.buildMode = await confirmBuild();
        // 	} catch (error) {
        // 		logger.error(error);
        // 		process.exit(1);
        // 	}
        // } else {
        // 	globalThis.buildMode = true;
        // }
        // if (globalThis.buildMode) {
        logger_1.logger.info("Executing build process");
        yield (0, utils_1.combineDocumentation)();
        // }
        if (argv.saveConfig) {
        }
        // await saveConfigToFile(argv);
        logger_1.logger.info("Done!");
        return;
    }),
};
/**
 * Defines the command module for the "guided" command, which provides a guided experience for generating the API documentation.
 *
 * This command module is responsible for guiding the user through the process of generating the API documentation. It prompts the user for various configuration options, such as the source and destination directories, and then generates the documentation based on those options.
 */
exports.guidedCommand = {
    command: "*",
    describe: "Guided documentation generator.",
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Guided mode\n");
        if (argv.debug) {
            (0, logger_1.setLogLevel)("debug");
        }
        logger_1.logger.debug("Loading configuration...");
        (0, config_1.default)(argv);
        logger_1.logger.debug("Successfully loaded configuration.");
        logger_1.logger.info("Executing 'guided' command...");
        if (!globalThis.config) {
            logger_1.logger.error("\nInvalid configuration file; aborting.");
            process.exit(0);
        }
        globalThis.config.source = yield (0, inquirer_1.source)();
        globalThis.config.destination = yield (0, inquirer_1.destination)();
        globalThis.testMode = yield (0, inquirer_1.testMode)();
        if (globalThis.testMode) {
            logger_1.logger.info("Testing build process\n");
            try {
                yield (0, utils_1.combineDocumentation)();
                logger_1.logger.verbose("Test complete.");
                globalThis.testMode = false;
                globalThis.buildMode = yield (0, inquirer_1.confirmBuild)();
            }
            catch (error) {
                logger_1.logger.error(error);
                process.exit(1);
            }
        }
        else {
            globalThis.buildMode = true;
        }
        if (globalThis.buildMode) {
            logger_1.logger.info("Executing build process");
            yield (0, utils_1.combineDocumentation)();
        }
        yield (0, config_1.saveConfigToFile)(argv);
        logger_1.logger.info("Done!");
        return;
    }),
};
