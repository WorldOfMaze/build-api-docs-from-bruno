declare const globals: {
	config: Config;
};

/**
 * Represents the arguments for the build command.
 * @property {string} source - The source directory or file to build.
 * @property {string} destination - The destination directory to write the build output.
 * @property {boolean} silent - Indicates whether the build process should run silently, without producing any output.
 * @property {boolean} verbose - Indicates whether the build process should output detailed information about the process to the console.
 */
export type BuildCommandArgs = {
	destination: string;
	silent: boolean;
	source: string;
	test: boolean;
	verbose: boolean;
};

/**
 * Represents the options for the build command.
 * @property {boolean} [silent] - Indicates whether the build process should run silently, without producing any output.
 * @property {boolean} [verbose] - Indicates whether the build process should output detailed information about the process to the console.
 * @property {boolean} [test] - Indicates that the build process should only test the process, without writing any files.
 */
export type BuildCommandOptions = {
	silent?: boolean;
	verbose?: boolean;
	test?: boolean;
};

/**
 * Represents the configuration object for the application, derived from the configSchema type.
 */
export type Config = Prettify<z.infer<typeof configSchema>>;

/**
 * Represents the options for combining documentation.
 * @property {boolean} silent - Indicates whether the build process should run silently, without producing any output.
 * @property {boolean} verbose - Indicates whether the build process should output detailed information about the process to the console.
 * @property {boolean} test - Indicates that the build process should only test the process, without writing any files.
 */
export type CombineDocumentationOptions = {
	silent: boolean;
	verbose: boolean;
	test: boolean;
};
/**
 * Represents the arguments for the init command.
 * @property {boolean} silent - Indicates whether the init process should run silently, without producing any output.
 * @property {boolean} verbose - Indicates whether the init process should output detailed information about the process to the console.
 */
export type InitCommandArgs = {
	configFile: string;
	force: boolean;
	silent: boolean;
	verbose: boolean;
};

/**
 * Represents the options for the init command.
 * @property {boolean} [silent] - Indicates whether the init process should run silently, without producing any output.
 * @property {boolean} [verbose] - Indicates whether the init process should output detailed information about the process to the console.
 * @property {boolean} [force] - Indicates whether the init process should force the operation, even if it would overwrite existing files.
 */
export type InitCommandOptions = {
	configFileName: string;
	force?: boolean;
	silent?: boolean;
	verbose?: boolean;
};

/**
 * Represents the different log levels that can be used for logging.
 * - `"error"`: Indicates an error condition that should be logged.
 * - `"warn"`: Indicates a warning condition that should be logged.
 * - `"info"`: Indicates an informational message that should be logged.
 * - `"verbose"`: Indicates a verbose message that should be logged.
 * - `"debug"`: Indicates a debug-level message that should be logged.
 */
export type LogLevel = "error" | "warn" | "info" | "verbose" | "debug";

/**
 * Represents the options for logging.
 * @property {boolean} silent - Indicates whether logging should be silent, without producing any output.
 * @property {boolean} verbose - Indicates whether logging should output detailed information.
 */
export type LogOptions = {
	silent: boolean;
	verbose: boolean;
};

/**
 * Prettifies a type `T` by creating a new type with the same properties as `T`, but with the `unknown` type added to the intersection.
 * This can be useful for creating a type that has the same shape as another type, but with additional properties or constraints.
 *
 * @template T The type to be prettified.
 * @returns A new type with the same properties as `T`, but with the `unknown` type added to the intersection.
 */
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & unknown;