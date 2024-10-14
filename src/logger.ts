import { createLogger, format, transports } from 'winston';

const { align, cli, combine, colorize, errors, printf, timestamp } = format;

const consoleFormat = combine(cli(), errors({ stack: true }));
const fileFormat = combine(
  // colorize({ all: true }),
  errors({ stack: true }),
  timestamp(),
  align(),
  printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.json(),
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
    new transports.File({
      filename: 'process.log',
      format: fileFormat,
    }),
  ],
});

const closeTransports = () => {
  logger.transports.forEach(transport => {
    if (typeof transport.close === 'function') {
      transport.close();
    }
  });
};
process.on('exit', closeTransports);
process.on('SIGINT', () => {
  closeTransports();
  process.exit();
});
