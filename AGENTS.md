# Contexto del Proyecto CEISH


## Descripción

Sistema web para la gestión del proceso de evaluación ética de investigaciones por parte del CEISH.

El sistema permite gestionar:

- Investigadores.
- Solicitudes.
- Investigaciones.
- Anexos.
- Estratificación de riesgo.
- Evaluaciones.
- Observaciones.
- Correcciones.
- Aprobaciones.


## Regla principal

Este sistema NO es un CRUD tradicional.

Está basado en un flujo de procesos con estados.

Toda implementación debe considerar:

- trazabilidad
- historial
- auditoría
- estados
- permisos


## Usuarios


### Investigador

Puede:

- solicitar cuenta
- crear investigaciones
- subir documentos
- responder observaciones


### Miembro CEISH

Puede ser:

INTERNAL:
- estratificar
- evaluar


EXTERNAL:
- evaluar únicamente


Un miembro puede cambiar su función dependiendo de la investigación.


### Administrador

Puede:

- gestionar usuarios
- aprobar solicitudes
- asignar miembros
- revisar investigaciones
- administrar anexos
- realizar acciones CEISH


## Arquitectura esperada


Frontend:

React


Backend:

NestJS


ORM:

Prisma


Base de datos:

PostgreSQL


Archivos:

MinIO


Infraestructura:

Docker Compose



## Reglas para desarrollo


Nunca:

- eliminar historial
- sobrescribir evaluaciones antiguas
- cambiar estados directamente desde frontend


Toda acción importante debe generar trazabilidad.


## Diseño de datos


Las entidades principales son:


users

investigations

annexes

risk_assessments

evaluations

assignments

observations

corrections


## Antes de implementar

Siempre revisar:

docs/

antes de crear código.


---


## Estado actual del proyecto


### Capa de datos — COMPLETADA


#### Infraestructura Docker

Archivo: `docker-compose.yml` en la raíz del proyecto.

Servicios:

- postgres (PostgreSQL 15) — puerto 5433 del host (el 5432 está ocupado por una instalación local de PostgreSQL en Windows)
- minio — puertos 9000 (API S3) y 9001 (consola web)

Variables de entorno en `.env` (no commitear) y `.env.example` (plantilla).


#### ORM y migraciones

Carpeta: `database/`

- `database/prisma/schema.prisma` — modelo completo de Prisma
- `database/prisma/migrations/` — migración inicial aplicada (`20260628042527_init`)
- `database/prisma/seed.ts` — seed inicial ejecutado exitosamente
- `database/package.json` — scripts de gestión
- `database/README.md` — documentación completa de la capa de datos


#### Tablas creadas (24 en total)

Identidad:
- users
- investigator_profiles
- ceish_member_profiles

Investigaciones:
- research_types
- investigations
- investigation_participants

Anexos versionados:
- annex_templates
- annex_versions
- annex_fields
- investigation_annexes
- annex_answers

Estratificación:
- risk_assessments
- risk_assessment_members

Evaluación:
- evaluation_processes
- evaluation_assignments
- conflict_declarations

Evaluaciones:
- evaluations
- evaluation_criteria_responses

Correcciones:
- observations
- observation_responses
- correction_rounds

Archivos:
- documents

Auditoría:
- workflow_events


#### Datos seed insertados

- 1 usuario administrador (admin@ceish.local)
- 6 tipos de investigación
- 3 plantillas de anexos: Anexo 12, Anexo 23, Anexo 27 (versión 1 de cada uno, con sus campos)


#### Decisiones técnicas importantes

Herramientas de gestión:
Para inspeccionar la base de datos usar `npm run prisma:studio` (abre http://localhost:5555)
o conectarse con psql: `docker exec -it ceish_postgres psql -U ceish_user -d ceish_db`
PgAdmin fue removido porque era innecesario y fallaba al iniciar.

Puerto 5433 para PostgreSQL:
El host ya tiene PostgreSQL instalado localmente en el puerto 5432.
El contenedor Docker usa 5433 para evitar el conflicto.
La DATABASE_URL en `database/.env` apunta a `localhost:5433`.

Autenticación PostgreSQL:
El contenedor usa `md5` para conexiones TCP externas (pg_hba.conf).
El password del usuario `ceish_user` está almacenado como `md5`.

Variable DATABASE_URL en Windows:
PowerShell no pasa correctamente variables de entorno con caracteres especiales a Prisma.
Solución: usar un archivo `database/.env` con la URL sin comillas.
Al ejecutar migraciones manualmente usar:
`$env:DATABASE_URL = "postgresql://..." ; npx prisma migrate dev`

Versionado de anexos:
`investigation_annexes` referencia `annex_versions`, no `annex_templates`.
Esto garantiza que cada investigación conserva la versión exacta del anexo usada.

Historial inmutable:
`risk_assessments` se marca `REPLACED`, nunca se elimina.
`evaluation_assignments` removidas quedan con estado `REMOVED`.
`workflow_events` es el log de auditoría inmutable.


#### Rama git actual

backend

Commits realizados (sin push):
- `0b9ddaf` - chore: remove PgAdmin from docker-compose (use Prisma Studio instead)
- `4f1b40a` - docs: update AGENTS.md with completed database layer status
- `1618673` - feat(database): add Prisma schema, initial migration and seed
- `6bde2d3` - chore: add docker-compose, .gitignore, .env.example and architecture docs


### Próximos pasos pendientes

- Backend NestJS (carpeta `backend/`)
- Frontend React (carpeta `frontend/`)
