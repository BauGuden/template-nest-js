import 'dotenv/config';
import Joi from 'joi';

export type NodeEnvironment = 'development' | 'test' | 'production';

interface RawEnvironment {
  NODE_ENV: NodeEnvironment;
  APP_NAME: string;
  PORT: number;
  API_PREFIX: string;
  CORS_ORIGINS: string;
  SWAGGER_ENABLED: boolean;
  DATABASE_ENABLED: boolean;
  DB_HOST: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_SCHEMA: string;
  DB_SYNCHRONIZE: boolean;
  DB_LOGGING: boolean;
}

const schema = Joi.object<RawEnvironment>({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  APP_NAME: Joi.string().trim().default('template-service'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().trim().default('api/v1'),
  CORS_ORIGINS: Joi.string().trim().default('*'),
  SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
  DATABASE_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  DB_HOST: Joi.string().trim().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_DATABASE: Joi.string().trim().default('template_db'),
  DB_USERNAME: Joi.string().trim().default('postgres'),
  DB_PASSWORD: Joi.string().allow('').default('postgres'),
  DB_SCHEMA: Joi.string().trim().default('public'),
  DB_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(false),
  DB_LOGGING: Joi.boolean().truthy('true').falsy('false').default(false),
}).unknown(true);

const result = schema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (result.error) {
  throw new Error(`Invalid environment configuration: ${result.error.message}`);
}

const values = result.value;
const toList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const env = Object.freeze({
  nodeEnv: values.NODE_ENV,
  appName: values.APP_NAME,
  port: values.PORT,
  apiPrefix: values.API_PREFIX.replace(/^\/|\/$/g, ''),
  corsOrigins: toList(values.CORS_ORIGINS),
  swaggerEnabled: values.SWAGGER_ENABLED,
  database: Object.freeze({
    enabled: values.DATABASE_ENABLED,
    host: values.DB_HOST,
    port: values.DB_PORT,
    name: values.DB_DATABASE,
    username: values.DB_USERNAME,
    password: values.DB_PASSWORD,
    schema: values.DB_SCHEMA,
    synchronize: values.DB_SYNCHRONIZE,
    logging: values.DB_LOGGING,
  }),
});
