<style>
  .back-to-top {
    font-size: 24px;
    margin-left: auto;
    position: absolute;
    right: 0;
    text-decoration: none;
    top: 50%;
    transform: translateY(-50%) scale(1, -1);
  }

  h2 {
    border-bottom: 1px solid #ccc;
    flex: 1;
  }

  .header-wrapper {
    align-items: center;
    display: flex;
    justify-content: space-between;
    position: relative;
    width: 100%;
  }
</style>

<div class="header-wrapper">
  <h1 id="top">build-api-docs-from-bruno</h1>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

![NPM Version](https://img.shields.io/npm/v/build-api-docs-from-bruno)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/build-api-docs-from-bruno)

![NPM License](https://img.shields.io/npm/l/build-api-docs-from-bruno)
![GitHub last commit](https://img.shields.io/github/last-commit/WorldOfMaze/build-api-docs-from-bruno)
![NPM Downloads](https://img.shields.io/npm/dw/build-api-docs-from-bruno)

![Coverage](./coverage/badge-branches.svg)

<div class="header-wrapper">
  <h2 id="toc">Table of Contents</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

**[Description](#description)**<br> **[Usage](#usage)**<br>

- [Global Options](#global-options)<br>
- [Commands](#commands)<br>
  - [Default](#default)<br>
  - [build](#build)<br>

**[Credits](#credits)**<br> **[License](#license)**<br>
**[Contributing](#contributing)**<br> **[Changelog](#changelog)**<br>

- [Release .1.0](#release-1-1-1)<br>
- [Enhancements in Progress](#enhancement-in-progress)<br>

**[Enhancements for Future Versions](#enhancements-for-future-versions)**<br>

<div class="header-wrapper">
  <h2 id="description">Description</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

This command line tool will build API documentation from Bruno collection
(`.bru`) files. Each of these files contains an optional `docs` section which
contains Markdown documentation for the endpoint. This tool will parse the
`.bru` files and generate a single Markdown file containing the documentation
for each endpoint. The resulting Markdown file will be saved to the output
directory.

<div class="header-wrapper">
  <h2 id="usage">Usage</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>
From the root directory of the project, run the following command:

`npx build-api-docs-from-bruno@latest [command] {options}`

<div class="header-wrapper">
  <h3 id="global-options">Global Options</h3>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

| Switch           | Type      | Default | Required | Description                                    |
| ---------------- | --------- | ------- | -------- | ---------------------------------------------- |
| `-q` `--silent`  | `boolean` | `false` | Optional | Suppresses all output to the console.          |
| `-r` `--verbose` | `boolean` | `false` | Optional | Outputs additional information to the console. |
| `--help`         |           |         |          | Displays help information.                     |
| `-v` `--version` |           |         |          | Displays version information.                  |

<div class="header-wrapper">
  <h3 id="commands">Commands</h3>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>
<div class="header-wrapper">
  <h4 id="default">Default</h4>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

<div class="header-wrapper">
  <h4 id="build">build</h4>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

Builds the API documentation from the Bruno collection files.

| Switch               | Type      | Default | Required | Description                                                             |
| -------------------- | --------- | ------- | -------- | ----------------------------------------------------------------------- |
| `-s` `--source`      | `string`  |         | Required | The path to the source directory containing the Bruno collection files. |
| `-d` `--destination` | `string`  |         | Required | The path to the output directory.                                       |
| `-t` `--test`        | `boolean` | `false` | Optional | Test the build process without writing the output file.                 |

<div class="header-wrapper">
  <h3 id="examples">Examples</h3>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

<div class="header-wrapper">
  <h2 id="credits">Credits</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

<div class="header-wrapper">
  <h2 id="license">License</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

<div class="header-wrapper">
  <h2 id="contributing">Contributing</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

<div class="header-wrapper">
  <h2 id="changelog">Change Log</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

<div class="header-wrapper">
  <h3 id="release-1-1-1">Release 1.1.0</h3>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

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
- [x] Mkek default command `guided` and remove the guided command
- [x] Update README.md

<div class="header-wrapper">
  <h3 id="enhancement-in-progress">Enhancements in Progress</h3>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

- [ ] Update unit tests; target 80% coverage

<div class="header-wrapper">
  <h2 id="enhancements-for-future-versions">Enhancements for future versions</h2>
  <a class="back-to-top" href="#top">&#x21B4;</a>
</div>

- [ ] Ensure all functions have current documentation
- [ ] Update [Commands](#commands) in README.md
- [ ] Update [Examples](#examples) in README.md
- [ ] Update [Global](#global-options) Options in README.md
- [ ] Convert from tsc to swc

<a class="back-to-top" href="#top">&#x21B4;</a>
