# CEISH Platform - Capa de Datos

## Tecnologías

- **PostgreSQL 15** — base de datos relacional
- **Prisma 5** — ORM y gestor de migraciones
- **MinIO** — almacenamiento de archivos (compatible S3)
- **Docker Compose** — infraestructura local de desarrollo

---

## Estructura

```
database/
├── prisma/
│   ├── schema.prisma        # Modelo completo de datos
│   ├── seed.ts              # Datos iniciales (admin, tipos, anexos)
│   └── migrations/          # Migraciones generadas por Prisma
├── package.json
├── tsconfig.json
└── README.md

(raíz del proyecto)
├── docker-compose.yml       # PostgreSQL + MinIO + PgAdmin
├── .env                     # Variables de entorno (no commitear)
└── .env.example             # Plantilla de variables
```

---

## Inicio rápido

### 1. Copiar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores si es necesario
```

### 2. Levantar la infraestructura

```bash
docker-compose up -d
```

Servicios disponibles:
| Servicio   | URL / Puerto            |
|------------|-------------------------|
| PostgreSQL | `localhost:5432`        |
| MinIO API  | `http://localhost:9000` |
| MinIO UI   | `http://localhost:9001` |
| PgAdmin    | `http://localhost:5050` |

### 3. Instalar dependencias

```bash
cd database
npm install
```

### 4. Ejecutar migraciones

```bash
npm run prisma:migrate:dev
# Nombre sugerido para la primera migración: init
```

### 5. Generar cliente Prisma

```bash
npm run prisma:generate
```

### 6. Ejecutar seed inicial

```bash
npm run prisma:seed
```

Esto crea:
- Usuario administrador: `admin@ceish.local` / `Admin@CEISH2024`
- 6 tipos de investigación
- Plantillas: Anexo 12, Anexo 23, Anexo 27 (versión 1 de cada uno)

### 7. Explorar la base de datos

```bash
npm run prisma:studio
# Abre Prisma Studio en http://localhost:5555
```

---

## Comandos útiles

| Comando                         | Descripción                                    |
|---------------------------------|------------------------------------------------|
| `npm run db:up`                 | Levantar contenedores Docker                   |
| `npm run db:down`               | Detener contenedores                           |
| `npm run db:reset`              | Destruir contenedores y volúmenes              |
| `npm run prisma:migrate:dev`    | Crear y aplicar nueva migración (desarrollo)   |
| `npm run prisma:migrate:deploy` | Aplicar migraciones en producción              |
| `npm run prisma:migrate:reset`  | Resetear DB y volver a aplicar todo            |
| `npm run prisma:generate`       | Regenerar cliente Prisma                       |
| `npm run prisma:seed`           | Ejecutar seed                                  |
| `npm run prisma:studio`         | Abrir Prisma Studio                            |
| `npm run prisma:validate`       | Validar schema.prisma                          |
| `npm run prisma:format`         | Formatear schema.prisma                        |

---

## Modelo de datos

### Grupos de entidades

```
1. Identidad y perfiles
   users
   investigator_profiles
   ceish_member_profiles

2. Investigaciones
   research_types
   investigations
   investigation_participants

3. Sistema de anexos (versionado)
   annex_templates
   annex_versions
   annex_fields
   investigation_annexes
   annex_answers

4. Estratificación de riesgo
   risk_assessments
   risk_assessment_members

5. Proceso de evaluación
   evaluation_processes
   evaluation_assignments
   conflict_declarations

6. Evaluaciones
   evaluations
   evaluation_criteria_responses

7. Observaciones y correcciones
   observations
   observation_responses
   correction_rounds

8. Documentos
   documents

9. Auditoría
   workflow_events
```

### Diagrama de estados de Investigación

```
CREATED
  → PENDING_ADMIN_REVIEW
    → REJECTED
    → APPROVED
      → WAITING_STRATIFICATION
        → STRATIFICATION
          → RISK_DEFINED
            → ADMIN_RISK_REVIEW
              → RESTRATIFICATION (→ vuelve a STRATIFICATION)
              → WAITING_EVALUATORS
                → WAITING_CONFLICT_CHECK
                  → UNDER_EVALUATION
                    → WAITING_RESEARCHER_RESPONSE
                      → FINAL_REVIEW
                        → COMPLETED
                        → CANCELLED
```

### Reglas de integridad implementadas

- **Historial inmutable**: `risk_assessments` se marca `REPLACED`, nunca se elimina.
- **Asignaciones**: los evaluadores removidos quedan con estado `REMOVED`.
- **Versionado de anexos**: `investigation_annexes` referencia `annex_versions`, no la plantilla directa.
- **Conflictos**: cada declaración queda registrada independientemente del resultado.
- **Ciclos de corrección**: `correction_rounds` tiene `roundNumber` único por proceso; nunca se sobreescriben.
- **Workflow events**: log de auditoría inmutable con actor, entidad, estado anterior/nuevo.

---

## Credenciales por defecto (solo desarrollo)

| Servicio   | Usuario               | Contraseña           |
|------------|-----------------------|----------------------|
| PostgreSQL | `ceish_user`          | `ceish_secret_2024`  |
| MinIO      | `ceish_minio`         | `ceish_minio_secret_2024` |
| PgAdmin    | `admin@ceish.local`   | `admin_ceish_2024`   |
| App Admin  | `admin@ceish.local`   | `Admin@CEISH2024`    |

> ⚠️ Cambiar todas las contraseñas antes de desplegar en producción.
