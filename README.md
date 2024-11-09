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

### Release 1.1.1

- [x] Remove CSS styling from README.md



### Release 1.1.0

- [x] Add error handling for source directory not existing
- [x] Add header content from `header.md` or a specified file
- [x] Add interactive mode
- [x] Add silent mode
- [x] Add support for a list of files or directories to **exclude** that are in
      the source path and end with `.bru`
- [x] Add tail content from `tail.md` or a specified file
- [x] Add test mode to run process and check for errors but not writing output
      file
- [x] Add verbose mode
- [x] Allow input of source path, output path and output file name
- [x] Display message if no command is provided
- [x] Make default command `guided` and remove the guided command
- [x] Update README.md
- [x] Update unit tests; target 80% coverage

### Enhancements in Progress

None

## Enhancements for future versions

- [ ] Add example to README.md
- [ ] Convert from tsc to swc
- [ ] Ensure all functions have current documentation
- [ ] Update [Commands](#commands) in README.md
- [ ] Update [Examples](#examples) in README.md
- [ ] Update [Global](#global-options) Options in README.md
