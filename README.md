# CEISH Platform

Plataforma del CEISH ULEAM para gestionar evaluaciones éticas de investigaciones. Esta versión contiene autenticación, solicitudes de investigadores, aprobación administrativa y la infraestructura Docker necesaria para ejecutarla localmente.

## Inicio con Docker

1. Copia `.env.example` a `.env` y reemplaza `POSTGRES_PASSWORD`, `JWT_SECRET` y `JWT_REFRESH_SECRET` por valores seguros.
2. Ejecuta `docker compose up --build` desde la raíz.
3. Abre la aplicación en `http://localhost:3001`.

Servicios disponibles:

| Servicio | URL |
| --- | --- |
| Frontend | `http://localhost:3001` |
| API y Swagger | `http://localhost:3000/api/docs` |
| MinIO | `http://localhost:9001` |
| PostgreSQL | `localhost:5433` |

`db-init` aplica las migraciones de `database/prisma` y carga datos de prueba idempotentes antes de iniciar la API.

## Validar autenticación

1. Registra un investigador interno o externo desde `/registro`.
2. Comprueba que el login rechaza la cuenta pendiente con un mensaje claro.
3. Inicia sesión como administrador con `admin@ceish.local` y `Admin@CEISH2024`.
4. En el panel administrador, aprueba la solicitud pendiente.
5. Inicia sesión con el investigador creado y confirma que llega a `/investigador`.
6. Prueba el rechazo o suspensión desde la API para comprobar que el login, refresh y rutas protegidas bloquean cuentas no activas.

El seed crea además miembros CEISH e investigadores activos descritos en `database/README.md`. Estas credenciales son exclusivas de desarrollo local.

## Comandos útiles

```powershell
docker compose up --build
docker compose logs -f db-init backend frontend
docker compose down
docker compose down -v # elimina los datos locales, incluido el seed
```

Para desarrollo fuera de Docker, instala las dependencias en `backend/` y `frontend/`, configura las variables de entorno y ejecuta los respectivos comandos `npm run dev` / `npm run start:dev`.
