# build-api-docs-from-bruno

!npm
!license
!downloads
!git

## Description
This command line tool will build API documentation from Bruno collection (`.bru`) files.  Each of these files contains an optional `docs` section which contains Markdown documentation for the endpoint.  This tool will parse the `.bru` files and generate a single Markdown file containing the documentation for each endpoint.  The resulting Markdown file will be saved to the output directory.

## Table of Contents

## Usage
From the root directory of the project, run the following command:

```npx build-api-docs-from-bruno@latest```

This tools will look for `.bru` files in the `Collections` directory in the root of the project and save the output to the `documentation` directory, also in the root of the project.    


> A future version will allow for the input of a source path, output path and output file name.

## Credits

## License

## Contributing

## Tests

## Todo
- [ ] Update README.md
- [ ] Add interactive mode
- [ ] Add silent mode
- [ ] Add verbose mode
- [ ] Allow input of source path, output path and output file name
- [ ] Add header content from `header.md` or a specified file
- [ ] Add tail content from `tail.md` or a specified file
- [ ] Add support for a list of files or directories to **include** that are not in the source path or do not end with `.bru`
- [ ] Add support for a list of files or directories to **exclude** that are in the source path and end with `.bru`
