import 'reflect-metadata';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnv } from './common/config/validate-env';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Глобальный winston logger
const createLogger = (): winston.Logger => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, context, service }) => {
        return `${timestamp} [${service || context || 'App'}] ${level}: ${message}`;
      }),
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.DailyRotateFile({
        filename: 'logs/api-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/errors-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
      }),
    ],
  });
};

async function bootstrap() {
  validateEnv();

  const logger = new Logger('Bootstrap');
  const winstonLogger = createLogger();

  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  // CORS — разрешённые домены
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('RawFree API')
    .setDescription('API для сервиса знакомств RawFree')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    }, 'BearerAuth')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    }, 'AdminAuth')
    .addTag('auth')
    .addTag('profile')
    .addTag('feed')
    .addTag('matches')
    .addTag('chats')
    .addTag('subscriptions')
    .addTag('admin')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`RawFree API запущен на порту ${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

bootstrap();
