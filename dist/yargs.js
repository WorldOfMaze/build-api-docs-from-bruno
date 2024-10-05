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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = exports.buildCommand = exports.registeredCommands = exports.commonOptions = void 0;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
exports.commonOptions = {
    config: {
        alias: "c",
        type: "string",
        describe: "Optional path to config file.",
    },
    destination: {
        alias: "d",
        type: "string",
        describe: "The path and name of the output file.",
        demandOption: true,
    },
    force: {
        alias: "f",
        type: "boolean",
        describe: "Overwrite existing data.",
        default: false,
    },
    silent: {
        alias: "q",
        type: "boolean",
        describe: "Produce no output.",
        default: false,
    },
    source: {
        alias: "s",
        type: "string",
        describe: "Path to folder containing .bru files.",
        demandOption: true,
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
 * Registers one or more commands with the application.
 *
 * This function takes a single command or an array of commands and adds them to the `registeredCommands` array. This allows the application to keep track of all the registered commands.
 *
 * @param command - A single command or an array of commands to register.
 */
function registerCommand(command) {
    if (typeof command === "string") {
        exports.registeredCommands.push(command);
    }
    else if (Array.isArray(command)) {
        exports.registeredCommands.push(...command);
    }
}
/**
 * Builds the API documentation.
 *
 * This command module is responsible for building the API documentation. It uses the `combineDocumentation` function to generate the documentation from the source files and write it to the specified destination file.
 *
 */
exports.buildCommand = {
    command: "build",
    describe: "Builds the API documentation.",
    builder: (yargs) => yargs
        .strict()
        .help()
        .version(false)
        .option("source", exports.commonOptions.source)
        .option("destination", exports.commonOptions.destination)
        .option("test", exports.commonOptions.test)
        .check((argv) => {
        if (argv.silent && argv.verbose) {
            throw new Error("Arguments silent and verbose are mutually exclusive");
        }
        return true;
    })
        .demandOption("source", "destination"),
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        const combineDocumentationOptions = {
            silent: argv.silent,
            verbose: argv.verbose,
            test: argv.test,
        };
        const logOptions = {
            silent: argv.silent,
            verbose: argv.verbose,
        };
        (0, utils_1.log)("info", `${combineDocumentationOptions.test ? "Testing build process" : "Building documentation"}...\n`, logOptions);
        try {
            const { destination: destinationFile, source: sourcePath } = argv;
            yield (0, utils_1.combineDocumentation)(String(sourcePath), String(destinationFile), combineDocumentationOptions);
            (0, utils_1.log)("verbose", `File processing complete\nDocumentation written to '${destinationFile}'\n`, logOptions);
        }
        catch (error) {
            if (error instanceof Error) {
                (0, utils_1.log)("error", error.message, logOptions);
            }
            else {
                (0, utils_1.log)("error", `An error occurred during the build: ${String(error)}`, logOptions);
            }
            (0, utils_1.log)("error", "\nBuild complete with errors; documentation may be incomplete.\n", logOptions);
        }
    }),
};
/**
 * Defines the command module for the "init" command, which initializes the configuration file.
 *
 * This command module is responsible for initializing the configuration file. It uses the `initConfigFile` function to create the configuration file.
 */
exports.initCommand = {
    command: "init",
    describe: "Initialize the configuration file.",
    builder: (yargs) => yargs
        .strict()
        .help()
        .option("force", exports.commonOptions.force)
        .check((argv) => {
        if (argv.silent && argv.verbose) {
            throw new Error("Arguments silent and verbose are mutually exclusive");
        }
        return true;
    }),
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        const initCommandOptions = {
            configFileName: constants_1.CONFIG_FILE_NAME,
            force: argv.force,
            silent: argv.silent || false,
            verbose: argv.verbose || false,
        };
        const logOptions = {
            silent: argv.silent,
            verbose: argv.verbose,
        };
        (0, utils_1.log)("info", "Initializing the configuration file...\n", logOptions);
        yield (0, utils_1.initConfigFile)(initCommandOptions);
    }),
};
registerCommand(exports.buildCommand.command);
registerCommand(exports.initCommand.command);
