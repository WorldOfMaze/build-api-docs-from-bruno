#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
// TODO: Change source and destination to be either command line arguments or config file settings
const source = "Collections";
const destination = "documentation/api.md";
(0, utils_1.combineDocumentation)(source, destination);
