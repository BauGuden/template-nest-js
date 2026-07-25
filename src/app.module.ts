import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { env } from './config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    ...(env.database.enabled ? [DatabaseModule] : []),
  ],
})
export class AppModule {}
