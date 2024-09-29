#!/usr/bin/env node

import packageJson from "../package.json";
import { combineDocumentation } from "./utils.js" assert { type: "json" };

// TODO: Change source and destination to be either command line arguments or config file settings
const source = "Collections";
const destination = "documentation/api.md";

console.clear();
console.log(`$packageJson.name@${packageJson.version}\n`);
console.log();
combineDocumentation(source, destination);
