import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class LoggingService implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    this.print('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.print('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.print('warn', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.print('debug', message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.print('verbose', message, optionalParams);
  }

  private print(level: string, message: any, optionalParams: any[]) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      params: optionalParams,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(log));
  }
}