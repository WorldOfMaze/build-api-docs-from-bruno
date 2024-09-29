#!/usr/bin/env node

const { combineDocumentation } = require("./utils.ts");

// TODO: Change source and destination to be either command line arguments or config file settings
const source = "Collections";
const destination = "documentation/api.md";

combineDocumentation(source, destination);
