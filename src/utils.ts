import { promises as fs, type Dirent } from "node:fs";
import path from "node:path";
import type { Arguments, ArgumentsCamelCase } from "yargs";
import type {
	BuildCommandArgs,
	CombineDocumentationOptions,
	Config,
	InitCommandOptions,
	LogLevel,
	LogOptions,
} from "../types";
import {
	DEFAULT_CONFIG_FILE_NAME,
	DEFAULT_DEFAULT_CONFIG_FILE_NAME,
	DEFAULT_EXCLUDES,
	DEFAULT_FORCE,
	DEFAULT_SILENT,
	DEFAULT_TEST,
	DEFAULT_VERBOSE,
} from "./constants";
import { configSchema } from "./schema";

/**
 * An object containing ANSI escape codes for various text formatting and color options.
 * These codes can be used to add color and formatting to console output.
 */
const Log = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
	// Foreground (text) colors
	fg: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		crimson: "\x1b[38m",
	},
	// Background colors
	bg: {
		black: "\x1b[40m",
		red: "\x1b[41m",
		green: "\x1b[42m",
		yellow: "\x1b[43m",
		blue: "\x1b[44m",
		magenta: "\x1b[45m",
		cyan: "\x1b[46m",
		white: "\x1b[47m",
		crimson: "\x1b[48m",
	},
};

/**
 * Checks if a configuration file exists and is readable.
 *
 * @param configFileName - The path to the configuration file to check.
 * @returns A Promise that resolves to `true` if the configuration file exists and is readable, `false` otherwise.
 * @throws {Error} If an error occurs while checking the file.
 */
export async function configFileExists(
	configFileName: string,
): Promise<boolean> {
	try {
		await fs.access(configFileName, fs.constants.R_OK);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Combines the documentation from multiple ".bru" files into a single output file.
 *
 * @param sourceFilePath - The path to the folder containing the ".bru" files.
 * @param destination - The path to the output file where the combined documentation will be written.
 * @param options - Optional build options, including a `test` flag to skip writing the output file.
 * @returns A Promise that resolves when the documentation has been combined.
 * @throws {Error} If the source path does not exist or an error occurs during the process.
 */
export async function combineDocumentation(
	argv: Arguments<BuildCommandArgs>,
): Promise<void> {
	console.log("ENTERING COMBINE DOCUMENTATION.");
	const config = await getConfig(argv);
	try {
		console.log("GETTING LIST OF FILES...");
		const files = await getBruFiles(config.source);
		console.log({ files });
		if (!files || files.length === 0) {
			log("warn", "No files found", config.logOptions);
			return;
		}

		// Delete the output file if it exists
		console.log("DELETING OUTPUT FILE IF NOT IN TEST MODE...");
		if (!config.test) {
			console.log("DELETING OUTPUT FILE...");
			try {
				await fs.unlink(config.destination);
				console.log("OUTPUT FILE DELETED.");
			} catch (error) {
				console.log(error);
				// Ignore if the file doesn't exist
			}
		}

		// Create the output file and get the writer
		console.log("CREATING OUTPUT FILE...");
		let outFileHandle = undefined;
		if (!config.test) {
			outFileHandle = await fs.open(config.destination, "w");
			console.log("OUTPUT FILE CREATED.");
		}

		console.log("READY TO PROCESS FILES...");
		for (let ndx = 0; ndx < files.length; ndx++) {
			if (files[ndx]) {
				console.log(`PROCESSING FILE ${files[ndx]}...`);
				await processBruFile(files[ndx], outFileHandle, config.logOptions);
			}
		}

		if (outFileHandle) {
			await outFileHandle.close();
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw "An unknown error occurred";
	}
}

/**
 * Throws an error with the provided message if the `value` parameter is not of type `never`.
 * This function is intended to be used as a guard in exhaustive switch statements to ensure all possible cases are handled.
 *
 * @param value - The value to check. This should be of type `never` if the switch statement is exhaustive.
 * @param message - The error message to throw if `value` is not of type `never`. Defaults to a generic message.
 * @throws {Error} If `value` is not of type `never`.
 */
export function exhaustiveSwitchGuard(
	value: never,
	message = `Unhandled value in switch statement: ${value}.`,
): void {
	throw new Error(message);
}

/**
 * Retrieves a list of ".bru" files from the specified source path.
 *
 * @param sourcePath - The path to the folder containing the ".bru" files.
 * @returns A Promise that resolves to an array of file paths for the ".bru" files found in the source path and its subdirectories.
 * @throws {Error} If the source path does not exist.
 */
async function getBruFiles(sourcePath: string) {
	try {
		const files = await getFolderItems(path.join(__dirname, "..", sourcePath));
		return files.filter((file) => file.endsWith(".bru"));
	} catch (error) {
		if (error instanceof Error) {
			console.log(error);
			throw new Error(`Source path '${sourcePath}' does not exist`);
		}
		throw error;
	}
}

/**
 * Retrieves the application configuration from a JSON file and sets any missing items to their default values.  If a configuration item is specified with a command line option, this value will be used instead of the default value.
 *
 * @param configFilePath - The path to the directory containing the configuration file.
 * @param configFileName - The name of the configuration file.
 * @param options - Options for logging.
 * @param argv - Command-line arguments.
 * @returns The parsed configuration object, or `false` if the configuration is invalid.
 */
export async function getConfig(
	argv: ArgumentsCamelCase<unknown>,
): Promise<Config> {
	//return the config from the globalThis if it exists
	// @ts-expect-error
	if (globalThis.config) {
		// @ts-expect-error
		return globalThis.config;
	}

	let configData: Config;

	// read the config file if it exists
	const configFileName = String(
		argv["config-file"] || DEFAULT_CONFIG_FILE_NAME,
	);
	const configFileNameWithPath = path.join(
		path.dirname(String(process.argv[1])),
		"..",
		configFileName,
	);
	const isExistingConfigFile = await configFileExists(configFileNameWithPath);
	if (isExistingConfigFile) {
		configData = await fs.readFile(configFileName, "utf-8");
	} else {
		configData = await fs.readFile(DEFAULT_DEFAULT_CONFIG_FILE_NAME, "utf-8");
	}
	const config = JSON.parse(configData) as Config;

	// validate the config
	const res = configSchema.safeParse(config);
	if (!res.success) {
		const errors = res.error.errors;
		errors.map((error) => {
			if (error.code === "unrecognized_keys") {
				console.log(`${error.message}: ${error.keys.join()}`);
			} else if (error.code === "invalid_type") {
				console.log(`${error.path} is ${error.message.toLowerCase()}`);
			} else {
				console.log(error.message);
			}
		});
		return false;
	}

	// config file is valid; check for any missing configuration files and set to defaults
	if (!config.excludes) config.excludes = DEFAULT_EXCLUDES;
	if (!config.force) config.force = DEFAULT_FORCE;
	// TODO: Check to see if header.md file exists and set config.header if it does
	if (!config.logOptions.silent) config.logOptions.silent = DEFAULT_SILENT;
	if (!config.logOptions.verbose) config.logOptions.verbose = DEFAULT_VERBOSE;
	// TODO: Check to see if tail.md file exists and set config.tail if it does
	if (!config.test) config.test = DEFAULT_TEST;

	// now check command line argument and override config as needed
	if (argv.destination) config.destination = argv.destination;
	if (argv.force) config.force = argv.force;
	if (argv.header) config.header = argv.header;
	if (argv.silent) config.silent = argv.silent;
	if (argv.source) config.logOptions.source = argv.source;
	if (argv.tail) config.tail = argv.tail;
	if (argv.test) config.test = argv.test;
	if (argv.verbose) config.logOptions.verbose = argv.verbose;

	// biome-ignore lint/suspicious/noExplicitAny: Unable to correctly type globalThis
	(globalThis as any).config = config as Config;

	return config;
}

/**
 * Retrieves the contents of a folder, recursively traversing any subdirectories.
 *
 * @param folderPath - The path to the folder to retrieve the contents of.
 * @returns A Promise that resolves to an array of file paths within the folder and its subdirectories.
 */
async function getFolderItems(folderPath: string): Promise<string[]> {
	const folderEntities = (await fs.readdir(folderPath, {
		withFileTypes: true,
	})) as Dirent[];
	const files: (string | string[])[] = await Promise.all(
		folderEntities.map((entity) => {
			const res = path.resolve(folderPath, entity.name);
			return entity.isDirectory() ? getFolderItems(res) : res;
		}),
	);
	return Array.prototype.concat(...files);
}

/**
 * Retrieves the metadata section from the content of a ".bru" file.
 *
 * @param fileContent - The content of the ".bru" file.
 * @returns The metadata section from the ".bru" file content, or `undefined` if the metadata section is not found.
 */
function getMetaData(
	fileContent: string,
	fileName: string,
	options: LogOptions,
): string | undefined {
	// console.log("line 278: ", options);
	const metaData = fileContent.match(/meta \{([^}]*)\}/);
	if (!metaData) {
		if (!options.silent)
			log(
				"warn",
				`  ${options.verbose ? "" : `${fileName}: `}Meta section is required to be a valid Bru file; skipping`,
				options,
			);
		return;
	}
	return metaData[1];
}
/**
 * Retrieves the name of an endpoint from the metadata section of a ".bru" file.
 *
 * @param metaData - The metadata section of the ".bru" file.
 * @returns The name of the endpoint, or `undefined` if the name is not found or is empty.
 */
function getEndpointName(
	metaData: string,
	options: CombineDocumentationOptions,
): string | undefined {
	const { silent } = options;

	const name = metaData.match(/.*name:\s*(.*)/i);
	if (!name || name[1] === "") {
		if (!silent)
			log(
				"warn",
				"  A name is required to be a valid Bru file; skipping",
				options,
			);
		return;
	}
	return name[1];
}

/**
 * Initializes a configuration file for the documentation build process.
 *
 * @param configFileName - The name of the configuration file to create.
 * @param force - If true, overwrites the existing configuration file.
 * @param silent - If true, suppresses logging output.
 * @param verbose - If true, enables verbose logging.
 */
export async function initConfigFile({
	configFileName,
	force,
	silent,
	verbose,
}: InitCommandOptions): Promise<void> {
	const logOptions: LogOptions = {
		silent: silent || false,
		verbose: verbose || false,
	};
	if (await configFileExists(configFileName)) {
		if (force) {
			log(
				"warn",
				`The configuration file already exists at '${configFileName}'.  It will be deleted and a new documentation file created.`,
				logOptions,
			);
			await fs.unlink(configFileName);
		} else {
			log(
				"warn",
				`The configuration file already exists at ${configFileName}; skipping.\n Use --force to overwrite the existing file.\n`,
				logOptions,
			);
			return;
		}
	}
	try {
		await fs.copyFile(
			DEFAULT_CONFIG_FILE_NAME,
			configFileName,
			force ? 0 : fs.constants.COPYFILE_EXCL,
		);
		log(
			"info",
			`The configuration file has been initialized at ${configFileName}\n You can now edit it to configure the documentation build process.\n`,
			logOptions,
		);
	} catch (error) {
		if (error instanceof Error) {
			if ("code" in error && error.code === "EEXIST") {
				log(
					"warn",
					`The configuration file already exists at ${configFileName}; skipping.\n Use --force to overwrite the existing file.\n`,
					logOptions,
				);
			} else {
				log(
					"error",
					`An error occurred while initializing the configuration file: ${error.message}`,
					logOptions,
				);
			}
		} else {
			log(
				"info",
				`The configuration file has been initialized at ${configFileName}\n You can now edit it to configure the documentation build process.\n`,
				logOptions,
			);
		}
	}
}

/**
 * Logs a message to the console with the specified log level and options.
 *
 * @param level - The log level to use for the message.
 * @param message - The message to log.
 * @param options - Options that control the logging behavior.
 */
export function log(
	level: LogLevel,
	message: string,
	options: LogOptions,
): void {
	switch (level) {
		case "error":
			if (!options.silent) console.error(Log.fg.red, message);
			break;
		case "warn":
			if (!options.silent) console.warn(Log.fg.yellow, message);
			break;
		case "info":
			if (!options.silent) console.info(Log.fg.white, message);
			break;
		case "verbose":
			if (options.verbose) console.info(Log.fg.white, message);
			break;
		case "debug":
			if (!options.silent) console.debug(Log.fg.white, message);
			break;
		default:
			exhaustiveSwitchGuard(level);
	}
}

/**
 * Generates a message indicating that the documentation content for the specified '.bru' file is missing.
 *
 * @param fileName - The name of the '.bru' file that is missing documentation.
 * @returns A string containing the message indicating the missing documentation.
 */
function missingDocumentationContent(fileName: string): string {
	return `

# ${fileName}

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
async function processBruFile(
	fileName: string,
	fileHandle: fs.FileHandle | undefined,
	options: CombineDocumentationOptions,
) {
	log("info", `Processing '${fileName}...'`, options);
	const endpointDocumentation = await readBruFileDocContent(fileName, options);
	if (fileHandle && endpointDocumentation) {
		await fileHandle.write(`${endpointDocumentation}\n\n`);
	}
}

/**
 * Reads the content of a ".bru" file and extracts the documentation section.
 *
 * @param fileName - The path to the ".bru" file to read.
 * @returns The documentation content from the ".bru" file, or a message indicating the file is not valid.
 */
async function readBruFileDocContent(
	fileName: string,
	options: CombineDocumentationOptions,
): Promise<string | undefined> {
	const content = await fs.readFile(fileName, "utf-8");
	const docContent = content.match(/docs \{([^}]*)\}/);
	if (!docContent) {
		const metaData = getMetaData(content, fileName, options);
		if (!metaData) return;

		const endpointName = getEndpointName(metaData, options);
		if (!endpointName) return;
		return missingDocumentationContent(endpointName);
	}
	return docContent[1];
}
