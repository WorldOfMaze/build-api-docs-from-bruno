import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ArgumentsCamelCase } from 'yargs';
import { Config } from '../types';
import {
  DEFAULT_CONFIG_FILE_NAME,
  DEFAULT_DEFAULT_CONFIG_FILE_NAME,
} from './constants';
import { logger } from './logger';
import { configSchema } from './schema';

let configData: Config | undefined;

/* export default */ function loadConfig(/* argv: ArgumentsCamelCase<unknown> */): Config {
  if (!configData) {
    let config = readConfigFile(
      String(/* argv['config-file'] || */ DEFAULT_CONFIG_FILE_NAME)
    );
    validateConfig(config);
    const updatedConfig = setMissingKeysToDefault(config);
    // const finalConfig = overrideKeysFromCLI(updatedConfig, argv);
    // configData = finalConfig;
    configData = updatedConfig;
  }
  return configData;
}

/**
 * Overrides the configuration object with values from the command-line arguments.
 *
 * @param config - The configuration object to override.
 * @param argv - The command-line arguments.
 * @returns The updated configuration object.
 */
export function overrideKeysFromCLI(
  config: Config,
  argv: ArgumentsCamelCase<unknown>
): Config {
  if (argv.destination) config.destination = argv.destination;
  if (argv.force) config.force = argv.force;
  if (argv.header) config.header = argv.header;
  if (argv.silent) config.silent = argv.silent;
  if (argv.source) config.logOptions.source = argv.source;
  if (argv.tail) config.tail = argv.tail;
  if (argv.test) config.test = argv.test;
  if (argv.verbose) config.logOptions.verbose = argv.verbose;
  return config;
}

/**
 * Reads the configuration file specified by the provided file name, or the default configuration file if the specified file does not exist.
 *
 * @param fileName - The name of the configuration file to read. If not provided, the default configuration file name will be used.
 * @returns The configuration object parsed from the configuration file.
 */
function readConfigFile(fileName: string): Config {
  const configFileName = String(fileName);
  const configFileNameWithPath = path.join(
    path.dirname(String(process.argv[1])),
    '..',
    configFileName
  );

  if (existsSync(configFileNameWithPath)) {
    try {
      logger.info(`Reading config file: ${configFileNameWithPath}`);
      configData = readFileSync(configFileName, 'utf-8');
    } catch (error) {
      logger.error(error);
      console.log('Error reading config file; see process.log for details');
      process.exit(1);
    }
  } else {
    try {
      logger.info(
        `Reading default config file: ${DEFAULT_DEFAULT_CONFIG_FILE_NAME}`
      );
      configData = readFileSync(DEFAULT_DEFAULT_CONFIG_FILE_NAME, 'utf-8');
    } catch (error) {
      logger.error(error);
      console.log('Error reading config file; see process.log for details');
      process.exit(1);
    }
  }
  const config = JSON.parse(configData) as Config;
  logger.verbose(`Config: ${JSON.stringify(config)}`);
  return config;
}

/**
 * Sets any missing keys in the provided configuration object to their default values.
 *
 * @param config - The configuration object to update with default values.
 * @returns The updated configuration object.
 */
function setMissingKeysToDefault(config: Config): Config {
  if (!config.excludes) config.excludes = [];
  if (!config.force) config.force = false;
  if (!config.logOptions.silent) config.logOptions.silent = false;
  if (!config.logOptions.verbose) config.logOptions.verbose = false;
}

/**
 * Validates the provided configuration object against a predefined schema.
 * If the configuration is invalid, logs the errors and exits the process.
 *
 * @param config - The configuration object to validate.
 * @returns void
 */
function validateConfig(config: unknown): void {
  const res = configSchema.safeParse(config);
  let configOk: boolean = true;
  if (!res.success) {
    const errors = res.error.errors;
    errors.map(error => {
      if (error.code === 'unrecognized_keys') {
        logger.warn(`${error.message}: ${error.keys.join()}; ignoring`);
      } else if (error.code === 'invalid_type') {
        logger.error(`${error.path} is ${error.message.toLowerCase()}`);
        configOk = false;
      } else {
        logger.error(error);
        configOk;
      }
    });
    if (!configOk) {
      console.log('Error reading config file; see process.log for details');
      process.exit(1);
    }
  }
}

module.exports = loadConfig();
