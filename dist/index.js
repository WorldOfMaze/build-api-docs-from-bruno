#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
const utils_1 = require("./utils");
// TODO: Change source and destination to be either command line arguments or config file settings
const source = "Collections";
const destination = "documentation/api.md";
// Log header information
console.clear();
console.log(`$packageJson.name@${package_json_1.default.version}\n`);
// Combine the documentation from the source folder into the destination file
(0, utils_1.combineDocumentation)(source, destination);
// Log completion message
console.log(`File processing complete\nDocumentation written to '${destination}'`);
