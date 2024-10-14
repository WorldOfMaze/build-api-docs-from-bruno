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
const logger_1 = require("./logger");
const utils_1 = require("./utils");
exports.commonOptions = {
    configFile: {
        alias: 'c',
        type: 'string',
        describe: 'Optional path to config file.',
    },
    destination: {
        alias: 'd',
        type: 'string',
        describe: 'The path and name of the output file.',
    },
    force: {
        alias: 'f',
        type: 'boolean',
        describe: 'Overwrite existing data.',
    },
    header: {
        type: 'string',
        describe: 'The path and name of the header file.',
    },
    silent: {
        alias: 'q',
        type: 'boolean',
        describe: 'Produce no output.',
    },
    source: {
        alias: 's',
        type: 'string',
        describe: 'Path to folder containing .bru files.',
    },
    tail: {
        type: 'string',
        describe: 'The path and name of the tail file.',
    },
    test: {
        alias: 't',
        type: 'boolean',
        describe: 'Test the documentation build process.',
    },
    verbose: {
        alias: 'r',
        type: 'boolean',
        describe: 'Log extra information.',
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
    if (typeof command === 'string') {
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
    command: 'build',
    describe: 'Builds the API documentation.',
    builder: yargs => yargs
        .strict()
        .help()
        .version(false)
        .option('destination', exports.commonOptions.destination)
        .option('silent', exports.commonOptions.silent)
        .option('source', exports.commonOptions.source)
        .option('test', exports.commonOptions.test)
        .option('verbose', exports.commonOptions.verbose)
        // TODO: move this check to getConfig()
        .check(argv => {
        if (argv.silent && argv.verbose) {
            throw new Error('Arguments silent and verbose are mutually exclusive');
        }
        return true;
    }),
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        const config = yield (0, utils_1.getConfig)(argv);
        logger_1.logger.info(`${config.test ? 'Testing build process' : 'Building documentation'}`);
        try {
            yield (0, utils_1.combineDocumentation)(argv);
            logger_1.logger.verbose(`File processing complete.`);
            logger_1.logger.verbose(`Documentation written to '${config.destination}'\n`);
        }
        catch (error) {
            if (error instanceof Error) {
                logger_1.logger.error(error.message);
            }
            else {
                logger_1.logger.error(`An error occurred during the build`);
                logger_1.logger.error(error);
            }
            logger_1.logger.error('Build complete with errors; documentation may be incomplete');
        }
    }),
};
/**
 * Defines the command module for the "init" command, which initializes the configuration file.
 *
 * This command module is responsible for initializing the configuration file. It uses the `initConfigFile` function to create the configuration file.
 */
// TODO: update initCommand to use config object
exports.initCommand = {
    command: 'init',
    describe: 'Initialize the configuration file.',
    builder: yargs => yargs
        .strict()
        .help()
        .option('force', exports.commonOptions.force)
        .check(argv => {
        if (argv.silent && argv.verbose) {
            throw new Error('Arguments silent and verbose are mutually exclusive');
        }
        return true;
    }),
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        const initCommandOptions = {
            configFileName: argv.configFile,
            force: argv.force,
            silent: argv.silent || false,
            verbose: argv.verbose || false,
        };
        logger_1.logger.info(`Initializing the configuration file at '${argv.configFile}'`);
        yield (0, utils_1.initConfigFile)(initCommandOptions);
    }),
};
registerCommand(exports.buildCommand.command);
registerCommand(exports.initCommand.command);
