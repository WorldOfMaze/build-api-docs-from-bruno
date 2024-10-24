import { confirm, input, select } from "@inquirer/prompts";
import fs from "node:fs";
import { logger } from "./logger";

/**
 * Prompts the user to confirm whether they want to continue with the build process, which will overwrite any prior documentation.
 *
 * @returns {Promise<boolean>} `true` if the user confirms they are ready to continue, `false` otherwise.
 */
export async function confirmBuild(): Promise<boolean> {
	const answer = await confirm({
		message: "Test completed.  Do you want to build the documentation?",
		default: true,
	});
	logger.verbose(`User provided build confirmation: ${answer}`);
	return answer;
}

export async function confirmOverwriteDocs(): Promise<boolean> {
	const answer = await confirm({
		message:
			"A documentation file already exists.  Do you want to overwrite it and create a new set of documentation?",
		default: true,
	});
	logger.verbose(
		`User provided documentation overwrite confirmation: ${answer}`,
	);
	return answer;
}

/**
 * Prompts the user to enter the destination file path for the documentation.
 * The file path must be a valid file name ending in `.md`.
 *
 * @returns {Promise<string>} The user-provided file path for the documentation.
 */
export async function destination(): Promise<string> {
	const answer = await input({
		message: "Where should the documentation file be saved?",
		default: "documentation/api.md",
		required: true,
		validate: (input) => {
			const regex = /^(?:[\w\-\s]+\/)*[\w\-\s]+\.md$/;
			if (regex.test(input)) {
				return true;
			}
			return "Invalid file path. Please enter a valid file name ending in .md";
		},
	});
	logger.verbose(`User provided destination: ${answer}`);
	return answer;
}

/**
 * Prompts the user to confirm whether they want to save the current options to the configuration file for future use. This will overwrite any existing configuration options.
 *
 * @returns {Promise<boolean>} `true` if the user wants to save the configuration, `false` otherwise.
 */
export async function saveConfig(): Promise<boolean> {
	const answer = await confirm({
		message:
			"Do you want to save these options to the configuration file for future use?  This will overwrite any existing configuration options.",
		default: true,
	});
	logger.verbose(`User provided save config: ${answer}`);
	return answer;
}

/**
 * Prompts the user to enter the location of the collection of Bruno files.
 * The file path must be a valid directory that exists on the file system.
 *
 * @returns {Promise<string>} The user-provided file path for the collection of Bruno files.
 */
export async function source(): Promise<string> {
	const answer = await input({
		message: "Where is the collection of Bruno files?",
		default: "Collections",
		required: true,
		validate: (input) => {
			if (fs.existsSync(input)) {
				return true;
			}
			return "Invalid file path. Please enter a valid file path.";
		},
	});
	logger.verbose(`User provided source: ${answer}`);
	return answer;
}

/**
 * Prompts the user to choose whether to save the documentation or just test the process.
 *
 * @returns {Promise<boolean>} `true` if the user wants to just test the process, `false` if the user wants to save the documentation.
 */
export async function testMode(): Promise<boolean> {
	const answer = await select({
		message: "Do you want to save the documentation or just test the process?",
		choices: [
			{
				name: "Yes, save the documentation",
				value: false,
			},
			{
				name: "No, just test the process without writing documentation",
				value: true,
			},
		],
	});
	logger.verbose(`User provided test mode: ${answer}`);
	return answer;
}
