// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { existsSync, unlinkSync } from "fs";
import path from "node:path";
import { createLogger, format, transports } from "winston";

const { align, cli, combine, errors, printf, timestamp } = format;
const filename = path.join(__dirname, "..", "bruno-doc.log");

if (existsSync(filename)) unlinkSync(filename);

/**
 * Closes all transports associated with the logger.
 * This function is called when the process is about to exit, ensuring that any open file transports are properly closed.
 */
const closeTransports = () => {
	for (const transport of logger.transports) {
		if (typeof transport.close === "function") {
			transport.close();
		}
	}
};

/**
 * A console transport for the logger that logs errors with their stack traces.
 * This transport is configured to log only error-level messages.
 */
const consoleTransport = new transports.Console({
	format: combine(cli(), errors({ stack: true })),
	level: "warn",
});

/**
 * A file transport for the logger that logs messages to a file.
 * This transport is configured to log messages with a timestamp, alignment, and a formatted message string.
 * The log level for this transport is set to the value of the `LOG_LEVEL` environment variable, or `'info'` if the environment variable is not set.
 */
const fileTransport = new transports.File({
	filename,
	format: combine(
		errors({ stack: true }),
		timestamp(),
		align(),
		printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
	),
	level: process.env.LOG_LEVEL || "info",
});

/**
 * Creates a Winston logger instance with the configured console and file transports.
 * The console transport logs error-level messages with their stack traces, while the file transport logs all messages with a timestamp, alignment, and formatted message string.
 * The log level for the file transport is set to the value of the `LOG_LEVEL` environment variable, or `'info'` if the environment variable is not set.
 */
export const logger = createLogger({
	transports: [consoleTransport, fileTransport],
});

/**
 * Gets the log levels for all transports associated with the logger.
 * @returns An array of objects, where each object has a key-value pair representing the transport name and its log level.
 */
export const getLogLevels = () => {
	const logLevels: Record<string, string>[] = [];

	for (const transport of logger.transports) {
		logLevels.push({
			[transport.constructor.name]: transport.level || "unknown",
		});
	}
	return logLevels;
};

/**
 * Logs the current log levels for all transports associated with the logger.
 * This function iterates over the transports and logs the log level for each transport.
 */
export const logLogLevels = () => {
	for (const transport of logger.transports) {
		logger.info(
			`Level log for ${transport.constructor.name} transport is '${transport.level}'.`,
		);
	}
};

/**
 * Sets the log level for the File transport of the logger.
 * @param level - The new log level to set for the File transport.
 */
export const setLogLevel = (level: string) => {
	logger.verbose(`Setting log level for File transport to '${level}'.`);
	fileTransport.level = level;
	logLogLevels();
};

process.on("exit", closeTransports);

process.on("SIGINT", () => {
	closeTransports();
	process.exit(0);
});
