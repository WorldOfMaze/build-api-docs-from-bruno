// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { existsSync, unlinkSync } from "fs";
import path from "node:path";
import type { StackFrame } from "stack-trace";
import type * as winston from "winston";
import { createLogger, format, transports } from "winston";

export let logger: winston.Logger | undefined;

const { cli, combine, errors, printf, timestamp } = format;
const filename = path.join(process.cwd(), "bruno-doc.log");
if (existsSync(filename)) unlinkSync(filename);

/**
 * Closes all transports associated with the logger.
 * This function is called when the process is about to exit, ensuring that any open file transports are properly closed.
 */
const closeTransports = () => {
	if (!logger) return;

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
	level: "info",
});

// TODO: Add documentation
// TODO: Add unit test
const createLoggerInstance = async () => {
	const stackTrace = await import("stack-trace");

	const createDebugFormat = (stackTrace: any) => {
		return printf((info) => {
			const { level, message, timestamp } = info;
			const trace = stackTrace.get();
			const caller: StackFrame = trace[21];

			const fileName = caller.getFileName()
				? path.basename(caller.getFileName())
				: " ";
			const lineNumber = caller.getLineNumber() ? caller.getLineNumber() : " ";
			const moduleInfo = `${fileName}:${lineNumber}`;

			return `${timestamp} [${level.toUpperCase()}] [${moduleInfo}] : ${message}`;
		});
	};

	const createFileTransport = (filename: string, stackTrace: any) => {
		const fileTransport = new transports.File({
			filename,
			format: combine(timestamp(), createDebugFormat(stackTrace)),
			level: process.env.LOG_LEVEL || "verbose",
		});
		return fileTransport;
	};

	const fileTransport = createFileTransport(filename, stackTrace);

	logger = createLogger({
		transports: [consoleTransport, fileTransport],
	});
};

// TODO: Add documentation
export const getFileTransportPath = (): string | undefined => {
	if (!logger) return;

	const fileTransport = logger.transports.find(
		(transport: any) => transport.constructor.name === "File",
	) as transports.FileTransportInstance;
	if (fileTransport) return path.resolve(fileTransport.filename);
};

export const initializeLogger = async () => {
	if (logger) return;

	await createLoggerInstance();

	process.on("exit", closeTransports);

	process.on("SIGINT", () => {
		closeTransports();
		process.exit(0);
	});
};

/**
 * Gets the log levels for all transports associated with the logger.
 * @returns An array of objects, where each object has a key-value pair representing the transport name and its log level.
 */
export const getLogLevels = (): Record<string, string>[] => {
	if (!logger) return [];

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
export const logLogLevels = (): void => {
	if (!logger) return;

	for (const transport of logger.transports) {
		logger.verbose(
			`Level log for ${transport.constructor.name} transport is '${transport.level}'.`,
		);
	}
};

/**
 * Sets the log level for the File transport of the logger.
 * @param level - The new log level to set for the File transport.
 */
export const setLogLevel = (level: string): void => {
	if (!logger) return;

	logger.verbose(`Setting log level for File transport to '${level}'.`);
	const fileTransport = logger.transports.find(
		(transport: any) => transport.constructor.name === "FileTransport",
	) as transports.FileTransportInstance;
	if (fileTransport) fileTransport.level = level;
	logLogLevels();
};

(async () => {
	const stackTrace = await import("stack-trace");
})();
