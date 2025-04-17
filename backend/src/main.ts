import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { LoggingService } from './logging/logging.service';
import { ApiKeyMiddleware } from './auth/api-key.middleware';
import { ErrorHandlingMiddleware } from './common/error.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Structured logging
  const logger = app.get(LoggingService);
  app.useLogger(logger);

  // API Key auth middleware
  app.use(ApiKeyMiddleware);

  // Error handling middleware
  app.use(ErrorHandlingMiddleware);

  // Config: set global prefix if configured
  const configService = app.get(ConfigService);
  const globalPrefix = configService.get('GLOBAL_PREFIX');
  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  // Start server
  const port = configService.get('PORT') || 4000;
  await app.listen(port);
  logger.log(`NestJS backend running on port ${port}`);
}

bootstrap();