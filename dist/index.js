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
const yargs_2 = require("./yargs");
// TODO: Read the configuration file if it exists; any parameter specified in the command line will override the configuration file.
// TODO: Echo the parameters being used to the console for each command.
// TODO: Fix help file as commands are no longer displayed, only options.
// Log header information
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .alias("h", "help")
    .alias("v", "version")
    .command({
    command: "*",
    handler: () => __awaiter(void 0, void 0, void 0, function* () {
        const source = yield (0, prompts_1.input)({
            message: "Where is the collection of Bruno files?",
            default: "Collections",
            required: true,
        });
        console.log({ source });
    }),
})
    .command(yargs_2.buildCommand)
    .command(yargs_2.initCommand)
    .demandCommand(1, "Please specify a command.")
    .help("h", "Show this help information.")
    .option("silent", yargs_2.commonOptions.silent)
    .option("verbose", yargs_2.commonOptions.verbose)
    .scriptName(package_json_1.default.name)
    .showHelp("log")
    .showHelpOnFail(true)
    .showVersion("log")
    .version("v", package_json_1.default.version)
    .wrap(process.stdout.columns)
    .parse();
