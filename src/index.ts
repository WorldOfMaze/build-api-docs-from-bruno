#!/usr/bin/env node

import "source-map-support/register";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import packageJson from "../package.json";
import {
	getFileTransportPath,
	initializeLogger,
	logLogLevels,
	logger,
} from "./logger";
import { buildCommand, commonOptions, guidedCommand } from "./yargs";

(async () => {
	console.log(`${packageJson.name} version ${packageJson.version}\n`);

	await initializeLogger();

	logger?.verbose(`${packageJson.name} version ${packageJson.version}`);
	logger?.verbose(`Module directory is ${__dirname}`);
	logger?.verbose(`Working directory is ${process.cwd()}`);
	logger?.verbose(`Log file will be saved to ${getFileTransportPath()}`);

	logLogLevels();

	logger?.verbose(
		`Command Line Arguments are ${JSON.stringify(hideBin(process.argv))}`,
	);

	let argv: { [key: string]: unknown };

	yargs(hideBin(process.argv))
		.alias("h", "help")
		.alias("v", "version")
		.array("excludes")
		.command({
			command: "*",
			handler: (argv) => {
				console.log({ argv });
			},
		})
		.command(guidedCommand)
		.command(buildCommand)
		.demandCommand()
		.exitProcess(false)
		.help("h", "Show this help information.")
		.option("configFile", commonOptions.configFile)
		.option("destination", commonOptions.destination)
		.option("debug", commonOptions.debug)
		.option("excludes", commonOptions.excludes)
		.option("force", commonOptions.force)
		.option("header", commonOptions.header)
		.option("silent", commonOptions.silent)
		.option("source", commonOptions.source)
		.option("saveConfig", commonOptions.saveConfig)
		.option("test", commonOptions.test)
		.option("tail", commonOptions.tail)
		.option("verbose", commonOptions.verbose)
		.parserConfiguration({
			"strip-aliased": true,
		})
		.scriptName(packageJson.name)
		.showHelpOnFail(true)
		.version("v", packageJson.version)
		.wrap(process.stdout.columns)
		.fail((message, error, yargs) => {
			if (error) throw error;
			console.error("Error", message);
			console.error(yargs.help());
			process.exit(1);
		})
		.usage("Usage: $0 <command> [options]")
		.parseAsync()
		.then((parsedArgv) => {
			argv = parsedArgv;
		})
		.catch((error) => {
			console.error("Error parsing arguments", error);
		});
})();
