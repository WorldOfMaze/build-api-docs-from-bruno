#!/usr/bin/env node

import { confirm, input, select } from '@inquirer/prompts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import packageJson from '../package.json';
import config from './config';
import { logger } from './logger';
import { combineDocumentation } from './utils';
import { buildCommand, commonOptions, initCommand } from './yargs';

// TODO: Echo the parameters being used to the console for each command.

console.log({ config });
// Log header information
yargs(hideBin(process.argv))
  .alias('h', 'help')
  .alias('v', 'version')
  .command({
    command: '*',
    describe: 'Bruno documentation generator.',
    handler: async argv => {
      logger.info(packageJson.name);
      logger.info(`Logging level is '${process.env.LOG_LEVEL}'`);
      if (!config) {
        logger.error('\nInvalid configuration file; aborting.');
        process.exit(0);
      }
      const source = await input({
        message: 'Where is the collection of Bruno files?',
        default: 'Collections',
        required: true,
      });
      config.source = source;
      const destination = await input({
        message: 'Where should the documentation file be saved?',
        default: 'documentation/api.md',
        required: true,
      });
      config.destination = destination;
      let test = await select({
        message:
          'Do you want to save the documentation of just test the process?',
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
        logger.info('Testing build process\n');
        try {
          await combineDocumentation();
          logger.verbose('File processing complete.');
          logger.verbose(`Documentation written to '${destination}'S`);
          const build = await confirm({
            message: 'Do you now want to actually build the documentation?',
            default: true,
          });
          if (build) test = false;
        } catch (error) {
          logger.error(error);
        }

        const confirmation = !test
          ? // TODO: skip this question if the documentation file does not exist
            await confirm({
              message:
                'Are you ready to continue?  If you do, the prior documentation will be overwritten.',
              default: true,
            })
          : false;
        if (confirmation) {
          logger.info('Executing build process');
        }

        const saveConfig = await confirm({
          message:
            'Do you want to save these options to the configuration file for future use?  This will overwrite any existing configuration options.',
          default: true,
        });

        if (saveConfig) {
          // TODO: save the configuration options to the configuration file
          logger.info('Saving configuration options');
        }
        logger.info('Done');
        return;
      }
    },
  })
  .command(buildCommand)
  .command(initCommand)
  .help('h', 'Show this help information.')
  .option('configFile', commonOptions.configFile)
  .option('silent', commonOptions.silent)
  .option('verbose', commonOptions.verbose)
  .scriptName(packageJson.name)
  .showHelpOnFail(true)
  .showVersion('log')
  .version('v', packageJson.version)
  .wrap(process.stdout.columns)
  .parse();
