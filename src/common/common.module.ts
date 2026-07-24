import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { env, NATS_SERVICE } from '../config';
import { NatsService } from './nats/nats.service';

const natsClientModule = ClientsModule.register([
  {
    name: NATS_SERVICE,
    transport: Transport.NATS,
    options: {
      servers: env.nats.servers,
      queue: env.nats.queue,
    },
  },
]);

@Global()
@Module({
  imports: [natsClientModule],
  providers: [NatsService],
  exports: [natsClientModule, NatsService],
})
export class CommonModule {}
