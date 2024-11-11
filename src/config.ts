import _ from "lodash";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Config } from "../types";
import { DEFAULT_DEFAULT_CONFIG_FILE_NAME } from "./constants";
import { saveConfig } from "./inquirer";
import { logger } from "./logger";
import { configSchema } from "./schema";

/**
 * Loads the application configuration from the specified configuration file and command-line arguments.
 *
 * This function first checks if the global `config` object is already set. If it is, it simply returns the existing configuration.
 *
 * If the `config` object is not set, it reads the configuration file specified by the `config-file` command-line argument, or the default configuration file name if the argument is not provided. It then validates the configuration data and sets any missing keys to their default values.
 *
 * Finally, it overrides the configuration object with any values from the command-line arguments using the `overrideKeysFromCLI` function, and sets the global `config` object to the updated configuration.
 *
 * @param argv - The command-line arguments.
 */
export default function loadConfig(argv: { [key: string]: unknown }) {
	if (globalThis.config) return;

	const configFile = String(argv["config-file"]);
	const config = readConfigFile(configFile);
	validateConfig(config);
	const updatedConfig = setMissingKeysToDefault(config);
	globalThis.config = overrideKeysFromCLI(updatedConfig, argv);
}

/**
 * Overrides the configuration object with values from the command-line arguments.
 *
 * This function takes the existing configuration object and the command-line arguments,
 * and updates the configuration object with any values from the command-line arguments.
 * The updated configuration object is then returned.
 *
 * @param config - The existing configuration object.
 * @param argv - The command-line arguments.
 * @returns The updated configuration object.
 */
export function overrideKeysFromCLI(
	config: Config,
	argv: { [key: string]: unknown },
): Config {
	if (argv.debug) config.debug = Boolean(argv.debug);
	if (argv.destination) config.destination = String(argv.destination);
	if (argv.header) config.header = String(argv.header);
	if (Array.isArray(argv.excludes)) config.excludes = argv.excludes as string[];
	if (argv.force) config.force = Boolean(argv.force);
	if (argv.silent) config.logOptions.silent = Boolean(argv.silent);
	if (argv.source) config.source = String(argv.source);
	if (argv.tail) config.tail = String(argv.tail);
	if (argv.verbose) config.logOptions.verbose = Boolean(argv.verbose);
	return config;
}

/**
 * Reads a configuration file from the specified file path and returns the parsed configuration data.
 *
 * If the specified configuration file does not exist, it will attempt to read the default configuration file instead.
 * If there is an error reading either the specified or default configuration file, it will log the error and exit the process.
 *
 * @param fileName - The path to the configuration file to read.
 * @returns The parsed configuration data.
 */
export function readConfigFile(fileName: string): Config {
	const configFileName = String(fileName);
	const configFileNameWithPath = path.join(
		path.dirname(process.cwd()),
		"..",
		configFileName,
	);

	logger?.debug(`Requested config file is '${configFileNameWithPath}'.`);
	let configData: Config | null = null;

	if (existsSync(configFileNameWithPath)) {
		logger?.debug("File exists; reading...");
		try {
			logger?.info(`Reading config file: '${configFileNameWithPath}'.`);
			configData = JSON.parse(readFileSync(configFileNameWithPath, "utf-8"));
		} catch (error) {
			logger?.error(error);
			logger?.warn("Error reading config file; see process.log for details.");
			process.exit(1);
		}
	} else {
		logger?.debug("File does not existing; trying default.");
		try {
			logger?.debug(
				`Reading default config file: '${path.join(__dirname, "..", DEFAULT_DEFAULT_CONFIG_FILE_NAME)}'.`,
			);
			configData = JSON.parse(
				readFileSync(
					path.join(__dirname, "..", DEFAULT_DEFAULT_CONFIG_FILE_NAME),
					"utf-8",
				),
			);
		} catch (error) {
			logger?.error(error);
			logger?.warn("Error reading config file; see process.log for details.");
			process.exit(1);
		}
	}
	logger?.verbose(`Config is:\n${JSON.stringify(configData, null, 2)}`);
	logger?.debug("Returning configuration data.");
	if (configData) return configData;

	logger?.error("Problem reading config file.");
	process.exit(1);
}

/**
 * Saves the current configuration to the specified configuration file.
 *
 * If the specified configuration file does not exist, it will be created.
 * If there is an error saving the configuration file, it will log the error and exit the process.
 *
 * @param argv - An object containing the command-line arguments, including the configuration file path.
 * @returns void
 */
export async function saveConfigToFile(argv: {
	[key: string]: unknown;
}): Promise<void> {
	const configFile = path.join(process.cwd(), String(argv["config-file"]));
	let configData = globalThis.config;

	// Read existing config file if it exists
	if (existsSync(configFile)) {
		try {
			const data = readFileSync(configFile, "utf8");
			const existingConfig = JSON.parse(data);

			// If configs are equal, return early
			if (_.isEqual(existingConfig, configData)) {
				return;
			}

			configData = { ...existingConfig, ...configData };
		} catch (err) {
			// console.log("ERROR", err);
			logger?.error(`Problem reading '${configFile}';  aborting!`);
			throw err;
		}
	}
	// Save configuration data to file
	if (await saveConfig()) {
		logger?.verbose(`Writing config file to '${configFile}'`);
		try {
			writeFileSync(configFile, JSON.stringify(configData, null, 2), "utf8");
			logger?.verbose("Configuration file updated!");
			logger?.verbose(JSON.stringify(configData, null, 2));
		} catch (err) {
			console.error({ err });
			logger?.error(`Error saving configuration file to '${configFile}'`);
			logger?.error(err);
			throw err;
		}
	}
}

/**
 * Sets any missing keys in the provided configuration object to their default values.
 *
 * @param config - The configuration object to update.
 * @returns The updated configuration object.
 */
function setMissingKeysToDefault(config: Config): Config {
	if (!config.debug) config.debug = false;
	if (!config.excludes) config.excludes = [];
	if (!config.force) config.force = false;
	if (!config.logOptions.silent) config.logOptions.silent = false;
	if (!config.logOptions.verbose) config.logOptions.verbose = false;
	return config;
}

/**
 * Validates the provided configuration object against a predefined schema.
 * If the configuration is invalid, logs the errors and exits the process.
 *
 * @param config - The configuration object to validate.
 * @returns void
 */
export function validateConfig(config: unknown): void {
	const res = configSchema.safeParse(config);
	let configOk = true;
	if (!res.success) {
		const errors = res.error.errors;
		errors.map((error) => {
			if (error.code === "unrecognized_keys") {
				logger?.warn(`${error.message}: ${error.keys.join()}; ignoring`);
			} else if (error.code === "invalid_type") {
				logger?.error(`${error.path} is ${error.message.toLowerCase()}`);
				configOk = false;
			} else {
				logger?.error(error);
				configOk = false;
			}
		});
	}
	const validConfig = config as Config;
	if (validConfig.logOptions.verbose && validConfig.logOptions.silent) {
		logger?.warn("Verbose and silent are mutually exclusive; ignoring both.");
		validConfig.logOptions.verbose = false;
		validConfig.logOptions.silent = false;
	}
	if (!configOk) {
		console.log("Error validating config file; see process.log for details");
		process.exit(1);
	}
}
