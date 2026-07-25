import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  NatsOptions,
  Transport,
} from '@nestjs/microservices';
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

async function bootstrap(): Promise<void> {
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

void bootstrap().catch((error: unknown) => {
  const stack = error instanceof Error ? error.stack : String(error);
  logger.error('Application failed to start', stack);
  process.exitCode = 1;
});
