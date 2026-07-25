# Template NestJS para microservicios NATS

Base reutilizable para microservicios NestJS que se comunican por NATS. Incluye
configuración validada, validación de DTOs, cliente NATS para solicitudes y
eventos, TypeORM/PostgreSQL opcional y Docker Compose.

No expone un servidor HTTP, rutas REST ni documentación Swagger.

## Requisitos

- Node.js 20.11 o superior.
- Yarn Classic 1.22.
- NATS para ejecutar el microservicio.
- PostgreSQL solo si `DATABASE_ENABLED=true`.

## Primera ejecución

```bash
yarn install --frozen-lockfile
Copy-Item .env.template .env
docker compose up -d nats
yarn start:dev
```

El microservicio se conecta por defecto a `nats://localhost:4222` y escucha en
la cola `template-service`.

## Patrones de ejemplo

El listener incluido en `src/health/health.controller.ts` responde a:

```text
template.health
template.ping
```

Renombra estos patrones en `src/config/services.ts` y reemplaza el módulo de
salud por módulos de tu dominio.

## Docker

Levantar el microservicio, NATS y PostgreSQL:

```bash
Copy-Item .env.compose.template .env.compose
docker compose --env-file .env.compose up --build
```

El puerto `4222` publica NATS y `8222` expone su monitor local. La aplicación
no publica puertos HTTP.

## Base de datos y migraciones

Activa PostgreSQL en `.env`:

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

## Scripts

```bash
yarn start:dev     # inicia el listener NATS con recarga
yarn start:prod    # ejecuta el microservicio compilado
yarn build         # compila a dist/
yarn lint          # ejecuta ESLint
yarn format:check  # comprueba formato
yarn test          # pruebas unitarias
```
