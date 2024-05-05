import { createLogger, format, transports } from 'winston';
import path from 'path'
import 'dotenv/config'

const filename: string = path.join(__dirname, process.env.LOCAL_FILE_LOG_ERRORS || '');

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
      new transports.File({ filename }), // Grava logs em um arquivo
      new transports.Console() // Mantém também o log no console
    ]
});