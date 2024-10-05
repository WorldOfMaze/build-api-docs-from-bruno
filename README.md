# build-api-docs-from-bruno

![NPM Version](https://img.shields.io/npm/v/build-api-docs-from-bruno)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/build-api-docs-from-bruno)
![NPM License](https://img.shields.io/npm/l/build-api-docs-from-bruno)

## Table of Contents
**[Description](#description)**<br>
**[Usage](#usage)**<br>
**[Global Options](#global-options)**<br>
**[Commands](#commands)**<br>
- *[build](#build)*<br>
- *[init](#init)*<br>

**[Credits](#credits)**<br>
**[License](#license)**<br>
**[Contributing](#contributing)**<br>
**[Tests](#tests)**<br>
**[Changelog](#changelog)**<br>
- *[Version1.1.0](#version-110)*<br>

**[Enhancements for Future Versions](#enhancements-for-future-versions)**<br>

## Description
This command line tool will build API documentation from Bruno collection (`.bru`) files.  Each of these files contains an optional `docs` section which contains Markdown documentation for the endpoint.  This tool will parse the `.bru` files and generate a single Markdown file containing the documentation for each endpoint.  The resulting Markdown file will be saved to the output directory.



## Usage
From the root directory of the project, run the following command:

```npx build-api-docs-from-bruno@latest [command] {options}```

### Global Options

| Switch           | Type      | Default | Required | Description                                    |
| ---------------- | --------- | ------- | -------- | ---------------------------------------------- |
| `-q` `--silent`  | `boolean` | `false` | Optional | Suppresses all output to the console.          |
| `-r` `--verbose` | `boolean` | `false` | Optional | Outputs additional information to the console. |
| `--help`         |           |         |          | Displays help information.                     |
| `-v` `--version` |           |         |          | Displays version information.                  |


### Commands
#### `build`
 Builds the API documentation from the Bruno collection files. 

| Switch               | Type      | Default | Required | Description                                                             |
| -------------------- | --------- | ------- | -------- | ----------------------------------------------------------------------- |
| `-s` `--source`      | `string`  |         | Required | The path to the source directory containing the Bruno collection files. |
| `-d` `--destination` | `string`  |         | Required | The path to the output directory.                                       |
| `-t` `--test`        | `boolean` | `false` | Optional | Test the build process without writing the output file.                 |

#### `init`
Initialize the configuration file.

| Switch         | Type      | Default | Required | Description                                                             |
| -------------- | --------- | ------- | -------- | ----------------------------------------------------------------------- |
| `-f` `--force` | `boolean` | false   | Optional | Forces overwriting of existing configuration file if it already exists. |

## Credits

## License

## Contributing

## Tests

## Change Log
### Version 1.1.0
- [x] Add error handling for source directory not existing
- [x] Add interactive mode
- [x] Add silent mode
- [x] Add test mode to run process and check for errors but not writing output file
- [x] Add verbose mode
- [x] Allow input of source path, output path and output file name
- [x] Display message if no command is provided
- [x] Update README.md

## Enhancements for Future Versions
- [ ] Add badge for node version 20.10.0
- [ ] Add badge for npm  version 10.8.2
- [ ] Add header content from `header.md` or a specified file
- [ ] Add support for a list of files or directories to **exclude** that are in the source path and end with `.bru`
- [ ] Add tail content from `tail.md` or a specified file
