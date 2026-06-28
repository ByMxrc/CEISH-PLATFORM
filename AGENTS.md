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