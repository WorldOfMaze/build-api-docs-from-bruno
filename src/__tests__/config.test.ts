import { describe, expect, it } from '@jest/globals';
import { Config } from '../../types';
import { overrideKeysFromCLI } from '../config';

describe('overrideKeysFromCLI', () => {
  const defaultConfig: Config = {
    destination: '',
    force: false,
    header: false,
    silent: false,
    logOptions: {
      source: false,
      verbose: false,
    },
    tail: false,
    test: false,
  };

  it('should override destination when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      destination: '/new/path',
      _: [],
      $0: '',
    });
    expect(result.destination).toBe('/new/path');
  });

  it('should override force when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      force: true,
      _: [],
      $0: '',
    });
    expect(result.force).toBe(true);
  });

  it('should override header when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      header: true,
      _: [],
      $0: '',
    });
    expect(result.header).toBe(true);
  });

  it('should override silent when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      silent: true,
      _: [],
      $0: '',
    });
    expect(result.silent).toBe(true);
  });

  it('should override source in logOptions when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      source: true,
      _: [],
      $0: '',
    });
    expect(result.logOptions.source).toBe(true);
  });

  it('should override tail when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      tail: true,
      _: [],
      $0: '',
    });
    expect(result.tail).toBe(true);
  });

  it('should override test when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      test: true,
      _: [],
      $0: '',
    });
    expect(result.test).toBe(true);
  });

  it('should override verbose in logOptions when provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      verbose: true,
      _: [],
      $0: '',
    });
    expect(result.logOptions.verbose).toBe(true);
  });

  it('should not modify the config when no overrides are provided', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      _: [],
      $0: '',
    });
    expect(result).toEqual(defaultConfig);
  });

  it('should handle multiple overrides', () => {
    const result = overrideKeysFromCLI(defaultConfig, {
      destination: '/custom/path',
      force: true,
      silent: true,
      verbose: true,
      _: [],
      $0: '',
    });
    expect(result).toEqual({
      ...defaultConfig,
      destination: '/custom/path',
      force: true,
      silent: true,
      logOptions: {
        ...defaultConfig.logOptions,
        verbose: true,
      },
    });
  });
});
