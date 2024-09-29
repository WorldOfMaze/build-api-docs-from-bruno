#!/usr/bin/env node

import packageJson from "../package.json";
import { combineDocumentation } from "./utils";

// TODO: Change source and destination to be either command line arguments or config file settings
const source = "Collections";
const destination = "documentation/api.md";

// Log header information
console.clear();
console.log(`${packageJson.name}@${packageJson.version}\n`);

// Combine the documentation from the source folder into the destination file
combineDocumentation(source, destination);

// Log completion message
console.log(
	`File processing complete\nDocumentation written to '${destination}'`,
);
