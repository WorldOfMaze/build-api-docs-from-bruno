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
require("source-map-support/register");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const package_json_1 = __importDefault(require("../package.json"));
const logger_1 = require("./logger");
const yargs_2 = require("./yargs");
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${package_json_1.default.name} version ${package_json_1.default.version}\n`);
    yield (0, logger_1.initializeLogger)();
    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.verbose(`${package_json_1.default.name} version ${package_json_1.default.version}`);
    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.verbose(`Module directory is ${__dirname}`);
    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.verbose(`Working directory is ${process.cwd()}`);
    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.verbose(`Log file will be saved to ${(0, logger_1.getFileTransportPath)()}`);
    (0, logger_1.logLogLevels)();
    logger_1.logger === null || logger_1.logger === void 0 ? void 0 : logger_1.logger.verbose(`Command Line Arguments are ${JSON.stringify((0, helpers_1.hideBin)(process.argv))}`);
    let argv;
    (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .alias("h", "help")
        .alias("v", "version")
        .array("excludes")
        .command({
        command: "*",
        handler: (argv) => {
            console.log({ argv });
        },
    })
        .command(yargs_2.guidedCommand)
        .command(yargs_2.buildCommand)
        .demandCommand()
        .exitProcess(false)
        .help("h", "Show this help information.")
        .option("configFile", yargs_2.commonOptions.configFile)
        .option("destination", yargs_2.commonOptions.destination)
        .option("debug", yargs_2.commonOptions.debug)
        .option("excludes", yargs_2.commonOptions.excludes)
        .option("force", yargs_2.commonOptions.force)
        .option("header", yargs_2.commonOptions.header)
        .option("silent", yargs_2.commonOptions.silent)
        .option("source", yargs_2.commonOptions.source)
        .option("saveConfig", yargs_2.commonOptions.saveConfig)
        .option("test", yargs_2.commonOptions.test)
        .option("tail", yargs_2.commonOptions.tail)
        .option("verbose", yargs_2.commonOptions.verbose)
        .parserConfiguration({
        "strip-aliased": true,
    })
        .scriptName(package_json_1.default.name)
        .showHelpOnFail(true)
        .version("v", package_json_1.default.version)
        .wrap(process.stdout.columns)
        .fail((message, error, yargs) => {
        if (error)
            throw error;
        console.error("Error", message);
        console.error(yargs.help());
        process.exit(1);
    })
        .usage("Usage: $0 <command> [options]")
        .parseAsync()
        .then((parsedArgv) => {
        argv = parsedArgv;
    })
        .catch((error) => {
        console.error("Error parsing arguments", error);
    });
}))();
//# sourceMappingURL=index.js.map