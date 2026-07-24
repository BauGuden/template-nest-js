# Template NestJS

Base reutilizable para construir APIs HTTP, microservicios NATS sin HTTP o
aplicaciones híbridas. Incluye configuración validada, Swagger, validación de
DTOs, TypeORM/PostgreSQL opcional, Docker multi-stage, Docker Compose, pruebas y
CI.

## Modos disponibles

| Modo | Comando de desarrollo | Qué inicia |
| --- | --- | --- |
| HTTP | `yarn start:http` | API REST y Swagger |
| Microservicio | `yarn start:microservice` | Listener NATS, sin servidor HTTP |
| Híbrido | `yarn start:hybrid` | API REST y listener NATS en el mismo proceso |

El modo se controla con `APP_MODE=http`, `APP_MODE=microservice` o
`APP_MODE=hybrid`. `yarn start:dev` usa HTTP como valor predeterminado.

## Requisitos

- Node.js 20.11 o superior (recomendado: Node.js 22 LTS).
- Yarn Classic 1.22.
- Docker y Docker Compose, únicamente si se utilizará la infraestructura
  incluida.

Habilite Yarn mediante Corepack si todavía no está instalado:

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

La API estará disponible en:

- Salud: `GET http://localhost:3000/api/v1/health`
- Swagger: `http://localhost:3000/docs`

El modo HTTP funciona sin NATS ni PostgreSQL. La base de datos solamente se
carga cuando `DATABASE_ENABLED=true`.

## Ejecutar cada tipo de proyecto

### API HTTP

Configure:

```dotenv
APP_MODE=http
DATABASE_ENABLED=false
```

Luego ejecute:

```bash
yarn start:http
```

### Microservicio NATS sin HTTP

Inicie NATS:

```bash
docker compose up -d nats
```

Configure `.env`:

```dotenv
APP_NAME=orders-service
APP_MODE=microservice
NATS_SERVERS=nats://localhost:4222
NATS_QUEUE=orders-service
```

Ejecute:

```bash
yarn start:microservice
```

El ejemplo responde a los patrones `template.health` y `template.ping`. Cambie
esos nombres por patrones propios del dominio en
`src/config/services.ts`.

### Aplicación híbrida

```bash
docker compose up -d nats
yarn start:hybrid
```

Este modo resulta útil para un gateway que expone HTTP y también consume eventos
o solicitudes de NATS. Para servicios independientes se recomienda desplegar
cada responsabilidad en su propio proceso.

## Docker

El `Dockerfile` tiene tres targets:

- `development`: dependencias de desarrollo y ejecución con watch.
- `build`: compilación TypeScript.
- `production`: imagen final sin dependencias de desarrollo y con usuario no
  root.

Construir y ejecutar únicamente la aplicación:

```bash
docker build --target production -t template-service .
docker run --rm -p 3000:3000 --env-file .env template-service
```

Levantar aplicación híbrida, NATS y PostgreSQL:

```bash
cp .env.compose.template .env.compose
docker compose --env-file .env.compose up --build
```

Detener los contenedores:

```bash
docker compose --env-file .env.compose down
```

Para eliminar también el volumen local de PostgreSQL:

```bash
docker compose --env-file .env.compose down --volumes
```

## PostgreSQL y migraciones

Active la integración en `.env`:

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
# Crear una migración vacía
yarn migration:create src/database/migrations/CreateUsers

# Generar una migración desde cambios en entidades
yarn migration:generate src/database/migrations/SyncSchema

# Aplicar o revertir
yarn migration:run
yarn migration:revert

# Ejecutar seeds
yarn seed
```

`DB_SYNCHRONIZE` debe permanecer en `false` en producción. Para un esquema
distinto de `public`, créelo antes de ejecutar migraciones.

## Usar el repositorio como template para varios proyectos

Para cada nuevo servicio:

1. Cree un repositorio a partir de esta base y ejecute `yarn install`.
2. Cambie `name`, `description` y `version` en `package.json`.
3. Copie `.env.template` a `.env` y asigne un `APP_NAME` descriptivo.
4. Asigne un `NATS_QUEUE` único por servicio. Los procesos que comparten la
   misma cola compiten por los mensajes; colas diferentes reciben su propia
   copia.
5. Renombre los patrones `template.*` de `src/config/services.ts`, por ejemplo
   `orders.create` u `inventory.reserve`.
6. Cree módulos por dominio con `yarn nest generate module modules/orders` y
   añada controllers, services, DTOs y entidades dentro del módulo.
7. Si varios proyectos se ejecutan en la misma máquina, asigne puertos HTTP,
   bases de datos y nombres de proyecto Compose distintos:

   ```bash
   APP_PORT=3001 POSTGRES_PORT=5433 \
     docker compose -p orders --env-file .env.compose up -d
   ```

8. Cambie `name: nest-template` en `compose.yml` o use siempre `docker compose
   -p <proyecto>` para aislar redes, contenedores y volúmenes.
9. Ejecute las validaciones antes de publicar:

   ```bash
   yarn format:check
   yarn lint
   yarn test
   yarn test:e2e
   yarn build
   ```

No copie un `.env` real entre proyectos ni lo suba al repositorio. Mantenga
solamente los archivos `*.template` con valores seguros.

## Estructura

```text
src/
├── common/                 # utilidades compartidas y cliente NATS
├── config/                 # variables validadas y patrones
├── database/               # TypeORM, migraciones y seeds
├── health/                 # ejemplo HTTP + MessagePattern
├── app.module.ts
└── main.ts                 # bootstrap http/microservice/hybrid
test/
└── app.e2e-spec.ts
```

## Scripts

```bash
yarn build          # compila a dist/
yarn format         # aplica Prettier
yarn format:check   # comprueba formato
yarn lint           # ESLint sin modificar archivos
yarn lint:fix       # ESLint con correcciones
yarn test           # pruebas unitarias
yarn test:cov       # cobertura
yarn test:e2e       # pruebas end-to-end
yarn start:prod     # ejecuta el build compilado
```

En producción establezca `NODE_ENV=production`, desactive Swagger, use secretos
externos para credenciales y ejecute primero `yarn build`.
