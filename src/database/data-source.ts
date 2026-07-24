import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { env } from '../config';

export const databaseOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  username: env.database.username,
  password: env.database.password,
  schema: env.database.schema,
  synchronize: env.database.synchronize,
  logging: env.database.logging,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
  seedTracking: true,
  namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource(databaseOptions);
