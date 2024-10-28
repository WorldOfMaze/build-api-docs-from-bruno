import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import fs from 'node:fs';
import type { Config } from '../../types';
import loadConfig, {
  overrideKeysFromCLI,
  readConfigFile,
  saveConfigToFile,
  validateConfig,
} from '../config';
import { DEFAULT_DEFAULT_CONFIG_FILE_NAME } from '../constants';
import * as inquirer from '../inquirer';
import { logger } from '../logger';

const mockConfig = {
  debug: false,
  destination: './docs',
  source: './collections',
  excludes: [],
  force: false,
  logOptions: {
    silent: false,
    verbose: false,
  },
};

jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

const mockedFs = jest.mocked(fs, { shallow: false });
// const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('node:fs');
jest.mock('../logger');
jest.mock('../inquirer');
let mockExit: SpyInstance;
let mockConsoleLog: SpyInstance;

describe('loadConfig', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs.existsSync.mockImplementation(() => false);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`Process exited with code ${code}`);
    });
    mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation((code?: number) => {
        throw new Error(`Process exited with code ${code}`);
      });
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    global.config = undefined;
  });

  it('should return early if global config is already set', () => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (global as any).config = { some: 'config' };
    loadConfig({});
    expect(mockedFs.existsSync).not.toHaveBeenCalled();
  });

  it('should read the specified config file if it exists', () => {
    const mockConfig: Config = {
      source: 'test-source',
      logOptions: { silent: true, verbose: false },
      destination: 'test-destination.md',
      excludes: [],
    };
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

    loadConfig({ 'config-file': 'custom-config.json' });

    expect(mockedFs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining('custom-config.json')
    );
    expect(mockedFs.readFileSync).toHaveBeenCalledWith(
      'custom-config.json',
      'utf-8'
    );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    expect((global as any).config).toEqual(expect.objectContaining(mockConfig));
  });

  it('should read the default config file if specified file does not exist', () => {
    const mockConfig: Config = {
      source: 'test-source',
      logOptions: { silent: true, verbose: false },
      destination: 'test-destination.md',
      excludes: [],
    };
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

    loadConfig({});

    expect(fs.readFileSync).toHaveBeenCalledWith(
      DEFAULT_DEFAULT_CONFIG_FILE_NAME,
      'utf-8'
    );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    expect((global as any).config).toEqual(expect.objectContaining(mockConfig));
  });

  it('should handle errors when reading the config file', () => {
    const mockError = new Error('Mock file read error');
    (mockedFs.existsSync as jest.Mock).mockReturnValue(true);
    (mockedFs.readFileSync as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    expect(() => readConfigFile('test-config.json')).toThrow(
      'Process exited with code 1'
    );
    expect(logger.error).toHaveBeenCalledWith(mockError);
    expect(logger.warn).toHaveBeenCalledWith(
      'Error reading config file; see process.log for details.'
    );
  });

  it('should handle errors when reading the default config file', () => {
    const mockError = new Error('Mock file read error');
    (mockedFs.existsSync as jest.Mock).mockReturnValue(false);
    (mockedFs.readFileSync as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    expect(() => readConfigFile('bad-config.json')).toThrow(
      'Process exited with code 1'
    );
    expect(logger.error).toHaveBeenCalledWith(mockError);
    expect(logger.warn).toHaveBeenCalledWith(
      'Error reading config file; see process.log for details.'
    );
  });

  it('should log warnings for unrecognized configuration keys and continue execution', () => {
    const config = {
      destination: 'test-destination.md',
      source: 'test-source',
      logOptions: {},
      unknownKey: 'value',
    };
    validateConfig(config);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported key(s)')
    );
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should log errors and exit for missing keys', () => {
    const config = {
      source: 'test-source',
      logOptions: {},
      unknownKey: 'value',
    };

    expect(() => validateConfig(config)).toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('destination is required')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Error validating config file; see process.log for details'
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should log errors and exit for invalid keys', () => {
    const config = {
      destination: 'test-destination.md',
      source: 'test-source',
      logOptions: {},
      unknownKey: 'value',
    };

    expect(() => validateConfig({ ...config, destination: 123 })).toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('expected string')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Error validating config file; see process.log for details'
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should set missing keys to default values', () => {
    const mockConfig: Config = {
      source: 'test-source',
      logOptions: {},
      destination: 'test-destination.md',
    };
    const expectedConfig: Config = {
      source: 'test-source',
      logOptions: { silent: false, verbose: false },
      destination: 'test-destination.md',
      excludes: [],
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

    loadConfig({});

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    expect((global as any).config).toEqual(
      expect.objectContaining(expectedConfig)
    );
  });

  it('should override config with CLI arguments', () => {
    const mockConfig: Config = {
      source: 'test-source',
      logOptions: {},
      destination: 'test-destination.md',
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

    loadConfig({ destination: 'cli-destination.md', verbose: true });
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    expect((global as any).config).toEqual(
      expect.objectContaining({
        source: 'test-source',
        destination: 'cli-destination.md',
        logOptions: { verbose: true, silent: false },
        excludes: [],
      })
    );
  });
});

describe('validateConfig', () => {
  it('should log warnings for unrecognized configuration keys and continue execution', () => {
    const config = {
      destination: 'test-destination.md',
      source: 'test-source',
      logOptions: {},
      unknownKey: 'value',
    };
    validateConfig(config);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported key(s)')
    );
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should log errors and exit for missing keys', () => {
    const config = {
      source: 'test-source',
      logOptions: {},
      unknownKey: 'value',
    };

    expect(() => validateConfig(config)).toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('destination is required')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Error validating config file; see process.log for details'
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should log errors and exit for invalid keys', () => {
    const config = {
      destination: 'test-destination.md',
      source: 'test-source',
      logOptions: {},
      unknownKey: 'value',
    };

    expect(() => validateConfig({ ...config, destination: 123 })).toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('expected string')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Error validating config file; see process.log for details'
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});

describe('overrideKeysFromCLI', () => {
  it('should override config with CLI arguments', () => {
    const config: Config = {
      source: 'original-source',
      destination: 'original-destination.md',
      header: 'original-header',
      tail: 'original-tail',
      excludes: [],
      logOptions: { silent: false, verbose: false },
    };

    const argv = {
      source: 'cli-source',
      destination: 'cli-destination.md',
      silent: true,
      verbose: true,
    };

    const result = overrideKeysFromCLI(config, argv);

    expect(result).toEqual({
      source: 'cli-source',
      destination: 'cli-destination.md',
      header: 'original-header',
      tail: 'original-tail',
      excludes: [],
      logOptions: { silent: true, verbose: true },
    });
  });

  it('should not override config keys that are not in CLI arguments', () => {
    const config: Config = {
      source: 'original-source',
      destination: 'original-destination.md',
      header: 'original-header',
      tail: 'original-tail',
      excludes: [],
      logOptions: { silent: false, verbose: false },
    };

    const argv = {
      source: 'cli-source',
    };

    const result = overrideKeysFromCLI(config, argv);

    expect(result).toEqual({
      source: 'cli-source',
      destination: 'original-destination.md',
      header: 'original-header',
      tail: 'original-tail',
      excludes: [],
      logOptions: { silent: false, verbose: false },
    });
  });
});
describe.only('saveConfigToFile', () => {
  let mockReadFile: jest.Mock;
  let mockWriteFile: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
    jest.spyOn(inquirer, 'saveConfig').mockResolvedValue(true);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`Process exited with code ${code}`);
    });
    mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation((code?: number) => {
        throw new Error(`Process exited with code ${code}`);
      });
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    global.config = undefined;

    // mockedFs.promises.readFile.mockImplementation(async (path, encoding) => {
    // 	console.log({ path, encoding });
    // 	if (path === "config-file") {
    // 		return JSON.stringify(mockConfig);
    // 	}
    // 	// throw new Error("File not found");
    // });
    // mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
    // mockReadFile = jest.fn();
    // mockWriteFile = jest.fn();
    // mockedFs.promises.readFile = mockReadFile;
    // mockedFs.promises.writeFile = mockWriteFile;
    // jest.mock("../inquirer")
    // jest.spyOn(fs.promises, "readFile").mockImplementation(mockReadFile);
    // jest.spyOn(fs.promises, "writeFile").mockImplementation(mockWriteFile);
    // mockExit = jest
    // 	.spyOn(process, "exit")
    // 	.mockImplementation((code?: number) => {
    // 		throw new Error(`Process exited with code ${code}`);
    // 	});
    global.config = {
      destination: 'test.md',
      source: 'source',
      logOptions: {},
    };
  });

  it("should create a new config file if it doesn't exist", async () => {
    mockedFs.existsSync.mockReturnValue(false);

    await saveConfigToFile({ 'config-file': 'new_config.json' });

    expect(mockWriteFile).toHaveBeenCalledWith(
      'new_config.json',
      JSON.stringify(global.config, null, 2),
      'utf8'
    );

    expect(logger.info).toHaveBeenCalledWith('Configuration file updated!');
  });

  it.only('should update existing config file with merged data', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockWriteFile = jest.fn((path, data, encoding, callback) => {
      if (typeof callback === 'function') {
        callback(null);
      }
    });

    saveConfigToFile({ 'config-file': 'bruno-doc.config.json' });

    expect(mockReadFile).toHaveBeenCalledWith(
      'bruno-doc.config.json',
      'utf8',
      expect.any(Function)
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      'bruno-doc.config.json',
      JSON.stringify({ ...mockConfig, ...global.config }, null, 2),
      'utf8',
      expect.any(Function)
    );
    expect(logger.info).toHaveBeenCalledWith('Configuration file updated!');
  });

  it('should handle write errors', () => {
    mockReadFile.mockImplementation((_path, _encoding, callback) => {
      callback(null, '{}');
    });

    const writeError = new Error('Write error');
    mockWriteFile.mockImplementation((_path, _data, _encoding, callback) => {
      callback(writeError);
    });

    expect(() => saveConfigToFile({})).toThrow('Process exited with code 1');

    expect(logger.error).toHaveBeenCalledWith(
      'Error saving configuration file to bruno-doc.config.json'
    );
    expect(logger.error).toHaveBeenCalledWith(writeError);
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should use custom config file name when provided', () => {
    const customConfigFile = 'test-config-file';
    mockReadFile.mockImplementation((_path, _encoding, callback) => {
      callback(null, '{}');
    });

    mockWriteFile.mockImplementation((_path, _data, _encoding, callback) => {
      callback(null);
    });

    saveConfigToFile({ 'config-file': 'test-config-file' });

    expect(mockReadFile).toHaveBeenCalledWith(
      customConfigFile,
      'utf8',
      expect.any(Function)
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      customConfigFile,
      expect.any(String),
      'utf8',
      expect.any(Function)
    );
  });
});
