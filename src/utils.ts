import { promises as fs, type Dirent } from "node:fs";
import path from "node:path";
import { exit } from "node:process";

/**
 * Combines the documentation from multiple ".bru" files into a single output file.
 *
 * @param sourceFilePath - The path to the folder containing the ".bru" files to combine.
 * @param destination - The path to the output file where the combined documentation will be written.
 * @returns A Promise that resolves when the documentation has been combined and written to the output file.
 */
export async function combineDocumentation(
	sourceFilePath: string,
	destination: string,
): Promise<void> {
	const files = await getBruFiles(sourceFilePath);
	if (!files || files.length === 0) {
		console.log("No files found");
		exit(0);
	}

	// Delete the output file if it exists
	await fs.unlink(destination);

	// Create the output file and get the writer
	const outFileHandle = await fs.open(destination, "w");

	for (let ndx = 0; ndx < files.length; ndx++) {
		if (files[ndx]) {
			await processBruFile(files[ndx], outFileHandle);
		}
	}
	// }

	// Close the file
	console.log(
		`File processing complete\nDocumentation written to ${destination}`,
	);
	await outFileHandle.close();
}

/**
 * Retrieves a list of files with the ".bru" extension from the specified source path.
 *
 * @param sourcePath - The path to the folder to retrieve the ".bru" files from.
 * @returns A Promise that resolves to an array of file paths for the ".bru" files within the folder and its subdirectories.
 */
async function getBruFiles(sourcePath: string) {
	return await getFolderItems(sourcePath)
		.then((files) => files.filter((file) => file.endsWith(".bru")))
		.catch((error) => {
			console.error(error);
			exit(1);
		});
}

/**
 * Retrieves the contents of a folder, recursively traversing any subdirectories.
 *
 * @param folderPath - The path to the folder to retrieve the contents of.
 * @returns A Promise that resolves to an array of file paths within the folder and its subdirectories.
 */
async function getFolderItems(folderPath: string): Promise<string[]> {
	const folderEntities = (await fs.readdir(folderPath, {
		withFileTypes: true,
	})) as Dirent[];
	const files: (string | string[])[] = await Promise.all(
		folderEntities.map((entity) => {
			const res = path.resolve(folderPath, entity.name);
			return entity.isDirectory() ? getFolderItems(res) : res;
		}),
	);
	return Array.prototype.concat(...files);
}

/**
 * Retrieves the metadata section from the content of a ".bru" file.
 *
 * @param fileContent - The content of the ".bru" file.
 * @returns The metadata section from the ".bru" file content, or `undefined` if the metadata section is not found.
 */
function getMetaData(fileContent: string): string | undefined {
	const metaData = fileContent.match(/meta \{([^}]*)\}/);
	if (!metaData) {
		console.log("  Meta section is required to be a valid Bru file; skipping");
		return;
	}
	return "";
}

/**
 * Retrieves the name of the endpoint from the metadata section of a ".bru" file.
 *
 * @param metaData - The metadata section of the ".bru" file content.
 * @returns The name of the endpoint, or `undefined` if the name is not found or is empty.
 */
function getEndpointName(metaData: string): string | undefined {
	const name = metaData[1]?.match(/name:\s*(.*)/);
	if (!name || name[1] === "") {
		console.log("  A name is required to be a valid Bru file; skipping");
		return;
	}
}

/**
 * Generates a message indicating that the documentation content for the specified '.bru' file is missing.
 *
 * @param fileName - The name of the '.bru' file that is missing documentation.
 * @returns A string containing the message indicating the missing documentation.
 */
function missingDocumentationContent(fileName: string): string {
	return `

# ${fileName[1]}

This endpoint is not documented.
`;
}

/**
 * Processes a ".bru" file by reading its documentation content and writing it to a file sink.
 *
 * @param fileName - The path to the ".bru" file to process.
 * @param writer - The file sink to write the documentation content to.
 * @returns A Promise that resolves when the file has been processed.
 */
async function processBruFile(fileName: string, fileHandle: fs.FileHandle) {
	const endpointDocumentation = await readBruFileDocContent(fileName);
	if (endpointDocumentation) {
		await fileHandle.write(`${endpointDocumentation}\n\n`);
	}
}

/**
 * Reads the content of a ".bru" file and extracts the documentation section.
 *
 * @param fileName - The path to the ".bru" file to read.
 * @returns The documentation content from the ".bru" file, or a message indicating the file is not valid.
 */
async function readBruFileDocContent(fileName: string | undefined) {
	console.log(`Processing '${fileName}'...`);
	if (!fileName) {
		console.log("  File is not valid; skipping");
		return;
	}
	const content = await fs.readFile(fileName, "utf-8");
	const docContent = content.match(/docs \{([^}]*)\}/);
	if (docContent === null) {
		const metaData = getMetaData(content);
		if (!metaData) return;

		const name = getEndpointName(metaData);
		if (!name) return;
		return missingDocumentationContent(name[1]);
	}
	return docContent[1];
}
