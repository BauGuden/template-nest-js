import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { env, NATS_SERVICE } from '../../config';

@Injectable()
export class NatsService implements OnApplicationShutdown {
  private readonly logger = new Logger(NatsService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async send<TResult, TPayload>(
    pattern: string,
    payload: TPayload,
  ): Promise<TResult> {
    this.logger.debug(`Requesting NATS pattern "${pattern}"`);

    return firstValueFrom(
      this.client
        .send<TResult, TPayload>(pattern, payload)
        .pipe(timeout(env.nats.requestTimeout)),
    );
  }

  emit<TPayload>(pattern: string, payload: TPayload): void {
    this.logger.debug(`Emitting NATS pattern "${pattern}"`);
    this.client.emit<void, TPayload>(pattern, payload).subscribe({
      error: (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Could not emit "${pattern}": ${message}`);
      },
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.close();
  }
}
