#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { buildCommand } from "./yargs";

// TODO: Echo the parameters being used to the console for each command.

// Log header information
yargs(hideBin(process.argv))
	// .alias("h", "help")
	// .alias("v", "version")
	// TODO: update default command to use config object
	// .command({
	// 	command: "*",
	// 	describe: "Bruno documentation generator.",
	// 	handler: async (argv) => {
	// 		const scriptName = String(argv._[1]);
	// 		const scriptPath = path.dirname(scriptName);
	// 		const configFileName = argv["config-file"] || DEFAULT_CONFIG_FILE_NAME;
	// 		const logOptions: LogOptions = {
	// 			silent: false,
	// 			verbose: false,
	// 			scriptName,
	// 			scriptPath,
	// 		};
	// 		log("info", `${packageJson.name}\n`, logOptions);
	// 		const config = await getConfig(
	// 			path.join(scriptPath, ".."),
	// 			configFileName,
	// 			logOptions,
	// 			argv,
	// 		);
	// 		if (!config) {
	// 			log("error", "\nInvalid configuration file; aborting.\n", logOptions);
	// 			process.exit(0);
	// 		}
	// 		globalThis.config = config;
	// 		const source = await input({
	// 			message: "Where is the collection of Bruno files?",
	// 			default: "Collections",
	// 			required: true,
	// 		});
	// 		const destination = await input({
	// 			message: "Where should the documentation file be saved?",
	// 			default: "documentation/api.md",
	// 			required: true,
	// 		});
	// 		let test = await select({
	// 			message:
	// 				"Do you want to save the documentation of just test the process?",
	// 			choices: [
	// 				{
	// 					name: "Yes, save the documentation",
	// 					value: false,
	// 				},
	// 				{
	// 					name: "No, just test the process without writing documentation",
	// 					value: true,
	// 				},
	// 			],
	// 		});
	// 		if (test) {
	// 			const combineDocumentationOptions: CombineDocumentationOptions = {
	// 				silent: false,
	// 				verbose: false,
	// 				test: true,
	// 			};
	// 			log("info", "Testing build process...\n", logOptions);
	// 			try {
	// 				await combineDocumentation(
	// 					source,
	// 					destination,
	// 					combineDocumentationOptions,
	// 				);
	// 				log(
	// 					"verbose",
	// 					`File processing complete\nDocumentation written to '${destination}'\n`,
	// 					logOptions,
	// 				);
	// 				const build = await confirm({
	// 					message: "Do you now want to actually build the documentation?",
	// 					default: true,
	// 				});
	// 				if (build) test = false;
	// 			} catch (error) {
	// 				if (error instanceof Error) {
	// 					log("error", error.message, logOptions);
	// 				} else {
	// 					log("error", `An error occurred: ${String(error)}`, logOptions);
	// 				}
	// 			}

	// 			const confirmation = !test
	// 				? await confirm({
	// 						message:
	// 							"Are you ready to continue?  If you do, the prior documentation will be overwritten.",
	// 						default: true,
	// 					})
	// 				: false;
	// 			if (confirmation) {
	// 				log("info", "Execute build process...", logOptions);
	// 			}

	// 			const saveConfig = await confirm({
	// 				message:
	// 					"Do you want to save these options to the configuration file for future use?  This will overwrite any existing configuration options.",
	// 				default: true,
	// 			});

	// 			if (saveConfig) {
	// 				log("info", "Saving configuration options...", logOptions);
	// 			}

	// 			log("info", "\nDone", logOptions);
	// 			return;
	// 		}
	// 	},
	// })
	.command(buildCommand)
	// .command(initCommand)
	// .help("h", "Show this help information.")
	// .option("configFile", commonOptions.configFile)
	// .option("silent", commonOptions.silent)
	// .option("verbose", commonOptions.verbose)
	// .scriptName(packageJson.name)
	// .showHelpOnFail(true)
	// .showVersion("log")
	// .version("v", packageJson.version)
	// .wrap(process.stdout.columns)
	.parse();
