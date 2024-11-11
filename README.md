# build-api-docs-from-bruno

![NPM Version](https://img.shields.io/npm/v/build-api-docs-from-bruno)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/build-api-docs-from-bruno)

![NPM License](https://img.shields.io/npm/l/build-api-docs-from-bruno)
![GitHub last commit](https://img.shields.io/github/last-commit/WorldOfMaze/build-api-docs-from-bruno)
![NPM Downloads](https://img.shields.io/npm/dw/build-api-docs-from-bruno)

![Coverage](./coverage/badge-statements.svg)

## Table of Contents

**[Description](#description)**<br>
**[Usage](#usage)**<br>
- [Global Options](#global-options)<br>
- [Commands](#commands)<br>
  - [Default](#default)<br>
  - [build](#build)<br>

**[Contributing](#contributing)**<br>
**[Changelog](#change-log)**<br>

- [Release 1.1.15](#release-1115)<br>
- [Release 1.1.14](#release-1114)<br>
- [Release 1.1.13](#release-1113)<br>
- [Release 1.1.12](#release-1112)<br>
- [Release 1.1.11](#release-1111)<br>
- [Release 1.1.10](#release-1110)<br>
- [Release 1.1.9](#release-119)<br>
- [Release 1.1.8](#release-118)<br>
- [Release 1.1.7](#release-117)<br>
- [Release 1.1.6](#release-116)<br>
- [Release 1.1.5](#release-115)<br>
- [Release 1.1.4](#release-114)<br>
- [Release 1.1.3](#release-113)<br>
- [Release 1.1.2](#release-112)<br>
- [Release 1.1.1](#release-111)<br>
- [Release 1.1.0](#release-110)<br>
- [Enhancements in Progress](#enhancements-in-progress)<br>

**[Enhancements for Future Versions](#enhancements-for-future-versions)**<br>

## Description

This command line tool will build API documentation from Bruno collection
(`.bru`) files. Each of these files contains an optional `docs` section which
contains Markdown documentation for the endpoint. This tool will parse the
`.bru` files and generate a single Markdown file containing the documentation
for each endpoint. The resulting Markdown file will be saved to the output
directory.


## Usage

### Environment Variables

| Variable Name | Description                                                                        | Values                                                      | Default Value |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- |
| LOG_LEVEL     | The level of logging to use for the log file.  Console log level is always `info`. | `error`<br />`warn`<br />`info`<br />`verbose`<br />`debug` | `verbose`     |

From the root directory of the project, run the following command:

`npx build-api-docs-from-bruno@latest [command] {options}`

### Global Options

| Switch           | Type      | Default | Required | Description                                    |
| ---------------- | --------- | ------- | -------- | ---------------------------------------------- |
| `-q` `--silent`  | `boolean` | `false` | Optional | Suppresses all output to the console.          |
| `-r` `--verbose` | `boolean` | `false` | Optional | Outputs additional information to the console. |
| `--help`         |           |         |          | Displays help information.                     |
| `-v` `--version` |           |         |          | Displays version information.                  |

### Commands

#### Default

#### build

Builds the API documentation from the Bruno collection files.

| Switch               | Type      | Default | Required | Description                                                             |
| -------------------- | --------- | ------- | -------- | ----------------------------------------------------------------------- |
| `-s` `--source`      | `string`  |         | Required | The path to the source directory containing the Bruno collection files. |
| `-d` `--destination` | `string`  |         | Required | The path to the output directory.                                       |
| `-t` `--test`        | `boolean` | `false` | Optional | Test the build process without writing the output file.                 |

### Examples

Examples will be provided in a future release.

## License</h2>

**GNU General Public License (GPL)**

This software is licensed under the GNU General Public License (GPL). The GPL allows users to freely use, copy, modify, and distribute this software under the following conditions:

  - Any modified versions of this software must also be licensed under the GPL.

  - The original or modified software cannot be sold or used for profit.

  - The source code must be made available when distributing the software.

For more detailed information, please visit the official [GNU GPL website](https://www.gnu.org/licenses/gpl-3.0.html).

## Contributing</h2>

To contribute, contact [RamonaSteve](mailto:steve@worldofmaze.us).

## Change Log

- 
### Release 1.1.15
- [x] Remove console logging for debugging file transport 
- 
### Release 1.1.14
- [x] Add exception handling for file transport
  
### Release 1.1.13
- [x] Added console logging for debugging file transport 
- 
### Release 1.1.12
- [x] Refactor logger to enhance logged information
- [x] Revert console log level to info
- [x] Add environment variable usage to README.md
- [x] Enhance logging for file overwrite
- [x] Remove deprecated code
- [x] Correct path for saving configuration file
-  
### Release 1.1.11
- [X] Added more debug code

### Release 1.1.10
- [X] Correct path for retrieval of Bruno files
  
### Release 1.1.9
- [X] Add additional logging
- [X] Correct path for retrieval of Bruno files
- 
### Release 1.1.8
- [X] Correct file path for source files
- 
### Release 1.1.7
- [X] Update console log level to debug
- [X] Correct file path for output file
- 
### Release 1.1.6
- [X] Add publishConfig to package.json
- [X] Set console logging to Verbose for debugging
- [X] Update TOC in README.md
- 
### Release 1.1.5
- [X] Add function to get logger's file transport path 
- [X] Write log file path to console at startup 
- [X] Remove unneeded debug code
  
### Release 1.1.4
- [X] Add debug code for logging

### Release 1.1.3
- [X] Fix regular expression for configuration file name

### Release 1.1.2
- [X] Fix output path for logger
- [X] Fix location for default configuration file
- [X] Fix location for all file reads and writes
  
### Release 1.1.1

- [X] Remove CSS styling from README.md



### Release 1.1.0

- [X] Add error handling for source directory not existing
- [X] Add header content from `header.md` or a specified file
- [X] Add interactive mode
- [X] Add silent mode
- [X] Add support for a list of files or directories to **exclude** that are in
      the source path and end with `.bru`
- [X] Add tail content from `tail.md` or a specified file
- [X] Add test mode to run process and check for errors but not writing output
      file
- [X] Add verbose mode
- [X] Allow input of source path, output path and output file name
- [X] Display message if no command is provided
- [X] Make default command `guided` and remove the guided command
- [X] Update README.md
- [X] Update unit tests; target 80% coverage

### Enhancements in Progress

None

## Enhancements for future versions


- [ ] Add example to README.md
- [ ] Convert from tsc to swc
- [ ] Correct npm badge in  README.md
- [ ] Ensure all functions have current documentation
- [ ] Update [Commands](#commands) in README.md
- [ ] Update [Examples](#examples) in README.md
- [ ] Update [Global](#global-options) Options in README.md
