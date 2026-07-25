# Template NestJS HTTP

Base reutilizable para construir APIs HTTP con NestJS. Incluye configuración
validada, Swagger, validación de DTOs, TypeORM/PostgreSQL opcional y Docker.

## Requisitos

- Node.js 20.11 o superior.
- Yarn Classic 1.22.
- Docker y Docker Compose, solo si utilizarás la infraestructura incluida.

Habilita Yarn mediante Corepack si todavía no está instalado:

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

## Primera ejecución

```bash
yarn install --frozen-lockfile
cp .env.template .env
yarn start:dev
```

La API quedará disponible en `http://localhost:3000/api/v1`. Swagger se publica
en `http://localhost:3000/docs` durante desarrollo.

La aplicación funciona sin PostgreSQL. La base de datos solo se carga cuando
`DATABASE_ENABLED=true`.

## Docker

Construir y ejecutar únicamente la API:

```bash
docker build --target production -t template-service .
docker run --rm -p 3000:3000 --env-file .env template-service
```

Levantar la API y PostgreSQL:

```bash
cp .env.compose.template .env.compose
docker compose --env-file .env.compose up --build
```

## PostgreSQL y migraciones

Activa la integración en `.env`:

```dotenv
DATABASE_ENABLED=true
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=template_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_SCHEMA=public
DB_SYNCHRONIZE=false
```

Comandos habituales:

```bash
yarn migration:create src/database/migrations/CreateUsers
yarn migration:generate src/database/migrations/SyncSchema
yarn migration:run
yarn migration:revert
yarn seed
```

`DB_SYNCHRONIZE` debe permanecer en `false` en producción.

## Usar como template

1. Cambia `name`, `description` y `version` en `package.json`.
2. Copia `.env.template` a `.env` y asigna un `APP_NAME` descriptivo.
3. Crea módulos por dominio con `yarn nest generate module modules/users`.
4. Ejecuta las validaciones antes de publicar:

   ```bash
   yarn format:check
   yarn lint
   yarn build
   ```

## Scripts

```bash
yarn start:dev     # servidor HTTP con recarga
yarn start:prod    # ejecuta el build compilado
yarn build          # compila a dist/
yarn lint           # ejecuta ESLint
yarn format:check   # comprueba formato
yarn test           # pruebas unitarias
```
