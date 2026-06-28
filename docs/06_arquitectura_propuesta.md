# Arquitectura Propuesta


## Backend

Framework:

NestJS


Responsabilidades:

- lógica de negocio.
- permisos.
- flujo de estados.
- validaciones.


---

## Frontend

React


Responsabilidades:

- interfaces.
- formularios.
- dashboards.


---

## Base de Datos

PostgreSQL


ORM:

Prisma


---

## Archivos

MinIO / S3 compatible


Uso:

- PDFs.
- anexos.
- documentos.


---

## Infraestructura


Docker Compose:


Servicios:


frontend

backend

postgres

minio


---

# Principio arquitectónico


El sistema debe estar orientado a procesos.


Las pantallas deben construirse alrededor del estado de una investigación.


La lógica no debe estar en frontend.


Las reglas deben vivir en backend.