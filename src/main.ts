import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  NatsOptions,
  Transport,
} from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from './config';

const logger = new Logger('Bootstrap');

function getNatsOptions(): NatsOptions {
  return {
    transport: Transport.NATS,
    options: {
      servers: env.nats.servers,
      queue: env.nats.queue,
    },
  };
}

function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

async function startHttp(hybrid = false): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix(env.apiPrefix);
  app.useGlobalPipes(createValidationPipe());
  app.enableCors({
    origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
    credentials: !env.corsOrigins.includes('*'),
  });

  if (hybrid) {
    app.connectMicroservice<MicroserviceOptions>(getNatsOptions(), {
      inheritAppConfig: true,
    });
    await app.startAllMicroservices();
    logger.log(
      `NATS listener connected to ${env.nats.servers.join(', ')} (queue: ${env.nats.queue})`,
    );
  }

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
    `${hybrid ? 'Hybrid' : 'HTTP'} application listening on http://localhost:${env.port}/${env.apiPrefix}`,
  );
}

async function startMicroservice(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    getNatsOptions(),
  );

  app.enableShutdownHooks();
  app.useGlobalPipes(createValidationPipe());
  await app.listen();

  logger.log(
    `NATS microservice listening on ${env.nats.servers.join(', ')} (queue: ${env.nats.queue})`,
  );
}

async function bootstrap(): Promise<void> {
  switch (env.appMode) {
    case 'microservice':
      await startMicroservice();
      break;
    case 'hybrid':
      await startHttp(true);
      break;
    case 'http':
      await startHttp();
      break;
  }
}

void bootstrap().catch((error: unknown) => {
  const stack = error instanceof Error ? error.stack : String(error);
  logger.error('Application failed to start', stack);
  process.exitCode = 1;
});
