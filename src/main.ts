import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from './config';

const logger = new Logger('Bootstrap');

function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix(env.apiPrefix);
  app.useGlobalPipes(createValidationPipe());
  app.enableCors({
    origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
    credentials: !env.corsOrigins.includes('*'),
  });

  if (env.swaggerEnabled && env.nodeEnv !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(`${env.appName} API`)
        .setDescription('HTTP API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(env.port);
  logger.log(
    `HTTP application listening on http://localhost:${env.port}/${env.apiPrefix}`,
  );
}

void bootstrap().catch((error: unknown) => {
  const stack = error instanceof Error ? error.stack : String(error);
  logger.error('Application failed to start', stack);
  process.exitCode = 1;
});
