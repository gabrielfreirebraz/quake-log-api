import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
    level: 'error',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [
      new transports.File({ filename: 'errors.log' }), // Grava logs em um arquivo
      new transports.Console() // Mantém também o log no console
    ]
});