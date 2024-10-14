import { promises as fs, type Dirent } from 'node:fs';
import path from 'node:path';
import type {
  CombineDocumentationOptions,
  InitCommandOptions,
  LogOptions,
} from '../types';
import config from './config';
import { DEFAULT_CONFIG_FILE_NAME } from './constants';
import { logger } from './logger';
/**
 * Checks if a configuration file exists and is readable.
 *
 * @param configFileName - The path to the configuration file to check.
 * @returns A Promise that resolves to `true` if the configuration file exists and is readable, `false` otherwise.
 * @throws {Error} If an error occurs while checking the file.
 */
export async function configFileExists(
  configFileName: string
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
 * This function retrieves a list of ".bru" files from the specified source path, and then processes each file to combine their documentation into a single output file. If the output file already exists, it is deleted before the new file is created.
 *
 * @param argv - The command-line arguments passed to the application.
 * @returns A Promise that resolves when the documentation has been combined.
 * @throws {Error} If an error occurs while processing the ".bru" files or creating the output file.
 */
export async function combineDocumentation(): Promise<void> {
  try {
    const files = await getBruFiles(config.source);
    if (!files || files.length === 0) {
      logger.warn('No files found');
      return;
    }

    // Delete the output file if it exists
    if (!config.test) {
      try {
        await fs.unlink(config.destination);
      } catch (error) {
        // Ignore if the file doesn't exist
      }
    }

    // Create the output file and get the writer

    // TODO: Check to see if the file exists and warn user before overwriting
    let outFileHandle = undefined;
    if (!config.test) {
      try {
        const dirName = path.dirname(config.destination);
        await fs.mkdir(dirName, { recursive: true });
        outFileHandle = await fs.open(config.destination, 'w');
      } catch (error) {
        logger.error(error);
        process.exit(1);
      }
    }

    for (let ndx = 0; ndx < files.length; ndx++) {
      if (files[ndx]) {
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
    throw 'An unknown error occurred';
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
  message = `Unhandled value in switch statement: ${value}.`
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
    const files = await getFolderItems(path.join(__dirname, '..', sourcePath));
    return files.filter(file => file.endsWith('.bru'));
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Source path '${sourcePath}' does not exist`);
      process.exit(1);
    }
    throw error;
  }
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
    folderEntities.map(entity => {
      const res = path.resolve(folderPath, entity.name);
      return entity.isDirectory() ? getFolderItems(res) : res;
    })
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
  options: LogOptions
): string | undefined {
  const metaData = fileContent.match(/meta \{([^}]*)\}/);
  if (!metaData) {
    if (!options.silent)
      logger.warn(
        `${fileName}: Meta section is required to be a valid .bru file; skipping`
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
function getEndpointName(metaData: string): string | undefined {
  const name = metaData.match(/.*name:\s*(.*)/i);
  if (!name || name[1] === '') {
    logger.warn('A name is required to be a valid .bru file; skipping');
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
}: InitCommandOptions): Promise<void> {
  if (await configFileExists(configFileName)) {
    if (force) {
      logger.warn(
        `The configuration file already exists at '${configFileName}' and has been deleted so a new documentation file created.`
      );
      await fs.unlink(configFileName);
    } else {
      logger.warn(
        `The configuration file already exists at ${configFileName} and will not be overwritten; use --force to overwrite the existing file.`
      );
      return;
    }
  }
  try {
    await fs.copyFile(
      DEFAULT_CONFIG_FILE_NAME,
      configFileName,
      force ? 0 : fs.constants.COPYFILE_EXCL
    );
    logger.info(
      `The configuration file has been initialized at ${configFileName}\n You can now edit it to configure the documentation build process.`
    );
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'EEXIST') {
        logger.warn(
          `The configuration file already exists at ${configFileName} and will not be overwritten; use --force to overwrite the existing file.`
        );
      } else {
        logger.error(
          `An error occurred while initializing the configuration file`
        );
        logger.error(error);
      }
    } else {
      logger.info(
        `The configuration file has been initialized at ${configFileName} and can now edited to configure the documentation build process.`
      );
    }
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
  options: CombineDocumentationOptions
) {
  logger.verbose(`Processing '${fileName}'`);
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
  options: CombineDocumentationOptions
): Promise<string | undefined> {
  const content = await fs.readFile(fileName, 'utf-8');
  const docContent = content.match(/docs \{([^}]*)\}/);
  if (!docContent) {
    const metaData = getMetaData(content, fileName, options);
    if (!metaData) return;

    const endpointName = getEndpointName(metaData);
    if (!endpointName) return;
    return missingDocumentationContent(endpointName);
  }
  return docContent[1];
}
