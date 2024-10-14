"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_LEVELS = exports.DEFAULT_VERBOSE = exports.DEFAULT_TEST = exports.DEFAULT_TAIL = exports.DEFAULT_SOURCE = exports.DEFAULT_SILENT = exports.DEFAULT_HEADER = exports.DEFAULT_FORCE = exports.DEFAULT_EXCLUDES = exports.DEFAULT_DESTINATION = exports.DEFAULT_DEFAULT_CONFIG_FILE_NAME = exports.DEFAULT_CONFIG_FILE_NAME = void 0;
exports.DEFAULT_CONFIG_FILE_NAME = 'bruno-doc.config.json';
exports.DEFAULT_DEFAULT_CONFIG_FILE_NAME = 'DEFAULT.config.json';
exports.DEFAULT_DESTINATION = 'documentation/api.md';
exports.DEFAULT_EXCLUDES = ['collections.bru', 'Local.bru'];
exports.DEFAULT_FORCE = false;
exports.DEFAULT_HEADER = 'documentation/header.md';
exports.DEFAULT_SILENT = false;
exports.DEFAULT_SOURCE = 'Collections';
exports.DEFAULT_TAIL = 'documentation/tail.md';
exports.DEFAULT_TEST = false;
exports.DEFAULT_VERBOSE = false;
exports.LOG_LEVELS = {
    debug: 'DEBUG',
    error: 'ERROR',
    info: 'INFO',
    verbose: 'VERBOSE',
    warn: 'WARN',
};
