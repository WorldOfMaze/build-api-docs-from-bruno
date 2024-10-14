import type { Arguments, Argv, CommandModule, Options } from 'yargs';
import type {
  BuildCommandArgs,
  InitCommandArgs,
  InitCommandOptions,
} from '../types';
import config from './config';
import { logger } from './logger';
import { combineDocumentation, initConfigFile } from './utils';

export const commonOptions: { [key: string]: Options } = {
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
export const registeredCommands: string[] = [];

/**
 * Registers one or more commands with the application.
 *
 * This function takes a single command or an array of commands and adds them to the `registeredCommands` array. This allows the application to keep track of all the registered commands.
 *
 * @param command - A single command or an array of commands to register.
 */
function registerCommand(command: unknown): void {
  if (typeof command === 'string') {
    registeredCommands.push(command);
  } else if (Array.isArray(command)) {
    registeredCommands.push(...command);
  }
}

/**
 * Builds the API documentation.
 *
 * This command module is responsible for building the API documentation. It uses the `combineDocumentation` function to generate the documentation from the source files and write it to the specified destination file.
 *
 */
export const buildCommand: CommandModule<unknown, BuildCommandArgs> = {
  command: 'build',
  describe: 'Builds the API documentation.',
  builder: yargs =>
    yargs
      .strict()
      .help()
      .version(false)
      .option('destination', commonOptions.destination)
      .option('silent', commonOptions.silent)
      .option('source', commonOptions.source)
      .option('test', commonOptions.test)
      .option('verbose', commonOptions.verbose)
      // TODO: move this check to config.ts
      .check(argv => {
        if (argv.silent && argv.verbose) {
          throw new Error(
            'Arguments silent and verbose are mutually exclusive'
          );
        }
        return true;
      }) as Argv<BuildCommandArgs>,
  handler: async (argv: Arguments<BuildCommandArgs>) => {
    logger.info(
      `${config.test ? 'Testing build process' : 'Building documentation'}`
    );
    try {
      await combineDocumentation();

      logger.verbose(`File processing complete.`);
      logger.verbose(`Documentation written to '${config.destination}'\n`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error(`An error occurred during the build`);
        logger.error(error);
      }
      logger.error(
        'Build complete with errors; documentation may be incomplete'
      );
    }
  },
};

/**
 * Defines the command module for the "init" command, which initializes the configuration file.
 *
 * This command module is responsible for initializing the configuration file. It uses the `initConfigFile` function to create the configuration file.
 */
// TODO: update initCommand to use config object
export const initCommand: CommandModule<unknown, InitCommandArgs> = {
  command: 'init',
  describe: 'Initialize the configuration file.',
  builder: yargs =>
    yargs
      .strict()
      .help()
      .option('force', commonOptions.force)
      .check(argv => {
        if (argv.silent && argv.verbose) {
          throw new Error(
            'Arguments silent and verbose are mutually exclusive'
          );
        }
        return true;
      }) as Argv<InitCommandArgs>,
  handler: async (argv: Arguments<InitCommandArgs>) => {
    const initCommandOptions: InitCommandOptions = {
      configFileName: argv.configFile,
      force: argv.force,
      silent: argv.silent || false,
      verbose: argv.verbose || false,
    };
    logger.info(`Initializing the configuration file at '${argv.configFile}'`);

    await initConfigFile(initCommandOptions);
  },
};

registerCommand(buildCommand.command);
registerCommand(initCommand.command);
