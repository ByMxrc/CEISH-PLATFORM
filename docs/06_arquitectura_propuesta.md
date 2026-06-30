# Arquitectura Propuesta CEISH

## Stack tecnológico

| Capa           | Tecnología        | Versión  |
|----------------|-------------------|----------|
| Frontend       | React             | 18+      |
| Backend        | NestJS            | 10+      |
| ORM            | Prisma            | 5.22     |
| Base de datos  | PostgreSQL        | 15       |
| Archivos       | MinIO             | latest   |
| Infraestructura| Docker Compose    | 3.9      |

## Servicios Docker

| Servicio    | Puerto host | Puerto container | Descripción                    |
|-------------|-------------|------------------|--------------------------------|
| PostgreSQL  | 5433        | 5432             | Base de datos principal        |
| MinIO API   | 9000        | 9000             | Almacenamiento de archivos S3  |
| MinIO UI    | 9001        | 9001             | Consola web MinIO              |

> Nota: PostgreSQL usa el puerto 5433 en el host para evitar conflictos con instalaciones locales de PostgreSQL.

## Modelo de datos

Ver `database/README.md` para la documentación completa del modelo.
