import type { Argv, CommandModule, Options } from "yargs";
import type { BuildCommandArgs, GuidedCommandArgs } from "../types";
import loadConfig, { saveConfigToFile } from "./config";
import { confirmBuild, destination, source, testMode } from "./inquirer";
import { logger, setLogLevel } from "./logger";
import { combineDocumentation } from "./utils";

export const commonOptions: { [key: string]: Options } = {
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
export const registeredCommands: string[] = [];

/**
 * Builds the API documentation.
 *
 * This command module is responsible for building the API documentation. It uses the `combineDocumentation` function to generate the documentation from the source files and write it to the specified destination file.
 *
 */
export const buildCommand: CommandModule<unknown, BuildCommandArgs> = {
	command: "go",
	describe: "Builds the API documentation without user input.",
	builder: (yargs) =>
		yargs.strict().help().version(false) as Argv<BuildCommandArgs>,
	handler: async (argv) => {
		console.log("UNattended mode\n");
		if (argv.debug) {
			setLogLevel("debug");
		}
		logger.debug("Loading configuration...");
		loadConfig(argv);
		logger.debug("Successfully loaded configuration.");

		logger.info("Executing 'go' command...");
		if (!globalThis.config) {
			logger.error("\nInvalid configuration file; aborting.");
			process.exit(0);
		}

		// globalThis.config.source = await source();
		// globalThis.config.destination = await destination();
		// globalThis.testMode = await testMode();
		if (argv.test) {
			logger.warn("Test mode not support in unattended more; skipping.");
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
		logger.info("Executing build process");
		await combineDocumentation();
		// }

		if (argv.saveConfig) {
		}
		// await saveConfigToFile(argv);

		logger.info("Done!");
		return;
	},
};

/**
 * Defines the command module for the "guided" command, which provides a guided experience for generating the API documentation.
 *
 * This command module is responsible for guiding the user through the process of generating the API documentation. It prompts the user for various configuration options, such as the source and destination directories, and then generates the documentation based on those options.
 */
export const guidedCommand: CommandModule<unknown, GuidedCommandArgs> = {
	command: "*",
	describe: "Guided documentation generator.",
	handler: async (argv) => {
		console.log("Guided mode\n");
		if (argv.debug) {
			setLogLevel("debug");
		}
		logger.debug("Loading configuration...");
		loadConfig(argv);
		logger.debug("Successfully loaded configuration.");

		logger.info("Executing 'guided' command...");
		if (!globalThis.config) {
			logger.error("\nInvalid configuration file; aborting.");
			process.exit(0);
		}

		globalThis.config.source = await source();
		globalThis.config.destination = await destination();
		globalThis.testMode = await testMode();

		if (globalThis.testMode) {
			logger.info("Testing build process\n");
			try {
				await combineDocumentation();
				logger.verbose("Test complete.");
				globalThis.testMode = false;
				globalThis.buildMode = await confirmBuild();
			} catch (error) {
				logger.error(error);
				process.exit(1);
			}
		} else {
			globalThis.buildMode = true;
		}

		if (globalThis.buildMode) {
			logger.info("Executing build process");
			await combineDocumentation();
		}

		await saveConfigToFile(argv);

		logger.info("Done!");
		return;
	},
};
