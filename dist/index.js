#!/usr/bin/env node
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
const prompts_1 = require("@inquirer/prompts");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const package_json_1 = __importDefault(require("../package.json"));
const constants_1 = require("./constants");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
const yargs_2 = require("./yargs");
// TODO: Echo the parameters being used to the console for each command.
// Log header information
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .alias('h', 'help')
    .alias('v', 'version')
    // TODO: update default command to use config object
    .command({
    command: '*',
    describe: 'Bruno documentation generator.',
    handler: (argv) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.info(package_json_1.default.name);
        logger_1.logger.info(JSON.stringify(constants_1.LOG_LEVELS, null, 2));
        const config = yield (0, utils_1.getConfig)(argv);
        if (!config) {
            logger_1.logger.error('\nInvalid configuration file; aborting.');
            process.exit(0);
        }
        globalThis.config = config;
        const source = yield (0, prompts_1.input)({
            message: 'Where is the collection of Bruno files?',
            default: 'Collections',
            required: true,
        });
        config.source = source;
        const destination = yield (0, prompts_1.input)({
            message: 'Where should the documentation file be saved?',
            default: 'documentation/api.md',
            required: true,
        });
        config.destination = destination;
        let test = yield (0, prompts_1.select)({
            message: 'Do you want to save the documentation of just test the process?',
            choices: [
                {
                    name: 'Yes, save the documentation',
                    value: false,
                },
                {
                    name: 'No, just test the process without writing documentation',
                    value: true,
                },
            ],
        });
        if (test) {
            logger_1.logger.info('Testing build process...\n');
            try {
                yield (0, utils_1.combineDocumentation)(argv);
                logger_1.logger.verbose('File processing complete.');
                logger_1.logger.verbose(`Documentation written to '${destination}'S`);
                const build = yield (0, prompts_1.confirm)({
                    message: 'Do you now want to actually build the documentation?',
                    default: true,
                });
                if (build)
                    test = false;
            }
            catch (error) {
                logger_1.logger.error(error);
            }
            const confirmation = !test
                ? // TODO: skip this question if the documentation file does not exist
                    yield (0, prompts_1.confirm)({
                        message: 'Are you ready to continue?  If you do, the prior documentation will be overwritten.',
                        default: true,
                    })
                : false;
            if (confirmation) {
                logger_1.logger.info('Executing build process...');
            }
            const saveConfig = yield (0, prompts_1.confirm)({
                message: 'Do you want to save these options to the configuration file for future use?  This will overwrite any existing configuration options.',
                default: true,
            });
            if (saveConfig) {
                // TODO: save the configuration options to the configuration file
                logger_1.logger.info('Saving configuration options...');
            }
            logger_1.logger.info('Done');
            return;
        }
    }),
})
    .command(yargs_2.buildCommand)
    .command(yargs_2.initCommand)
    .help('h', 'Show this help information.')
    .option('configFile', yargs_2.commonOptions.configFile)
    .option('silent', yargs_2.commonOptions.silent)
    .option('verbose', yargs_2.commonOptions.verbose)
    .scriptName(package_json_1.default.name)
    .showHelpOnFail(true)
    .showVersion('log')
    .version('v', package_json_1.default.version)
    .wrap(process.stdout.columns)
    .parse();
