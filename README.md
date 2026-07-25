# Template NestJS para microservicios NATS

Base reutilizable para microservicios NestJS que se comunican por NATS. Incluye
configuración validada, validación de DTOs, cliente NATS para solicitudes y
eventos, TypeORM/PostgreSQL opcional y Docker Compose.

No expone un servidor HTTP, rutas REST ni documentación Swagger.

## Crear un nuevo proyecto

Clona únicamente la rama `templatenonhttp` y usa el último argumento como el
nombre de tu proyecto:

```powershell
git clone --branch templatenonhttp --single-branch https://github.com/BauGuden/template-nest-js.git name-service
cd name-service
```

Puedes reemplazar `name-service` por el nombre que quieras, por ejemplo
`orders-service` o `payments-service`.

## Requisitos

- Node.js 20.11 o superior.
- Yarn Classic 1.22.
- NATS para ejecutar el microservicio.
- PostgreSQL solo si `DATABASE_ENABLED=true`.

## Configuración y primera ejecución

Instala las dependencias y crea tu archivo local de variables:

```powershell
yarn install --frozen-lockfile
Copy-Item .env.template .env
```

Edita `.env` para asignar al menos un nombre y una cola propios:

```dotenv
APP_NAME=orders-service
NATS_SERVERS=nats://localhost:4222
NATS_QUEUE=orders-service
DATABASE_ENABLED=false
```

`NATS_QUEUE` debe ser único por microservicio cuando cada servicio necesite
recibir todos los mensajes publicados. Activa `DATABASE_ENABLED=true` solo si
el microservicio necesita PostgreSQL.

Inicia NATS y luego el microservicio:

```powershell
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

Para detener la infraestructura:

```powershell
docker compose --env-file .env.compose down
```

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
