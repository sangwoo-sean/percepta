import { Params } from 'nestjs-pino';
import { join } from 'path';

export function createLoggerConfig(
  logLevel: string,
  logDir: string,
  isProduction: boolean,
): Params {
  const logFilePath = join(logDir, 'app');

  const targets: Array<{
    target: string;
    level: string;
    options: Record<string, unknown>;
  }> = [];

  // File transport with pino-roll for log rotation
  targets.push({
    target: 'pino-roll',
    level: logLevel,
    options: {
      file: logFilePath,
      frequency: 'daily',
      mkdir: true,
      extension: '.jsonl',
      limit: {
        count: 30, // Keep 30 days of logs
      },
      size: '10m', // 10MB max file size
    },
  });

  // Console transport with pino-pretty for development
  if (!isProduction) {
    targets.push({
      target: 'pino-pretty',
      level: logLevel,
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,context,req,res',
        messageFormat: '{msg}',
        singleLine: true,
      },
    });
  }

  return {
    pinoHttp: {
      level: logLevel,
      transport: {
        targets,
      },
      autoLogging: false, // Disable auto request logging (we use custom interceptor)
      quietReqLogger: true,
    },
  };
}
