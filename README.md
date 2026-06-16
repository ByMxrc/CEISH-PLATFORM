# CEISH Platform

Plataforma institucional para la evaluación de documentos académicos en formato PDF. Soporta tres roles de usuario — **estudiante**, **evaluador** y **administrador** — cada uno con su propia interfaz.

> Estado actual: frontend completo con datos mock en memoria. Backend en planificación (Node.js + PostgreSQL + Docker).

---

## Características

### Estudiante
- Subir un documento PDF con comentario descriptivo (drag-and-drop)
- Ver el estado de la entrega en tiempo real: pendiente / en revisión / revisado
- Consultar calificación y retroalimentación anónima del evaluador al finalizar la revisión
- Editar o eliminar la entrega mientras no haya sido evaluada

### Evaluador (Profesor)
- Ver lista de estudiantes asignados con filtros por estado
- Abrir un flujo de revisión de 4 etapas: Estructura, Metodología, Resultados y Formato
- Evaluar cada criterio (aprobar / rechazar) con observaciones y referencia de página en el PDF
- Navegar entre etapas y finalizar con calificación numérica y comentario final

### Administrador
- Ver todos los evaluadores y sus estudiantes asignados con estado de entrega
- Crear y eliminar asignaciones evaluador–estudiante desde un panel de dos columnas
- Búsqueda por nombre o correo en ambas columnas del panel de asignaciones
- Acceder directamente a cualquier revisión en curso

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 19 + TypeScript |
| Bundler | Vite 6 |
| Routing | React Router v7 |
| Estado global | Zustand v5 |
| Renderizado PDF | react-pdf / PDF.js |
| Estilos | CSS global con custom properties (sin Tailwind, sin CSS Modules) |
| Base de datos | PostgreSQL 16 en Docker (volumen persistente) |
| Acceso a datos | Cliente `pg` + rutas API en el dev server de Vite |

---

## Arquitectura de datos

El navegador no puede conectarse directamente a PostgreSQL (no permite sockets TCP).
Por eso el acceso a datos pasa por una capa mínima dentro del **propio dev server
de Vite** — sin un proyecto backend separado (sin NestJS/Express/API aparte):

```
React (navegador)
   src/services/*.ts        ── fetch ──►  rutas /api/* (plugin de Vite)
                                               │
                                          src/lib/database.ts  (pool pg único)
                                               │
                                               ▼
                                    PostgreSQL  (Docker + volumen)
```

- Los **componentes** llaman a `src/services/*` y nunca ejecutan SQL.
- El **SQL** vive en `src/server/queries/` (solo lado servidor).
- La **conexión** está centralizada en `src/lib/database.ts` (un solo pool).

---

## Estructura del proyecto

```
database/
├── schema.sql                    # Definición de tablas, índices y constraints
└── seed.sql                      # Datos de prueba
docker-compose.yml                # Servicio PostgreSQL + volumen persistente
src/
├── lib/
│   └── database.ts               # Pool pg único (lado servidor)
├── server/                       # Solo se ejecuta en el dev server de Vite (Node)
│   ├── apiPlugin.ts              # Plugin de Vite que enruta /api/*
│   └── queries/                  # SQL por dominio (users, submissions, ...)
├── services/                     # Lo que llaman los componentes (fetch, sin SQL)
│   ├── http.ts
│   ├── userService.ts
│   ├── submissionService.ts
│   ├── assignmentService.ts
│   └── reviewService.ts
├── app/
│   ├── router/index.tsx          # Rutas y redirección por rol (RootRedirect)
│   └── providers/AppProviders.tsx
├── features/
│   ├── auth/                     # Login con selección de usuario
│   ├── evaluation/               # Módulo de evaluación PDF standalone (legacy)
│   ├── student/                  # Vista de entrega de documento
│   ├── evaluator/                # Dashboard + flujo de revisión multi-etapa
│   └── admin/                    # Panel de administración y asignaciones
├── shared/
│   ├── types/platform.types.ts   # User, Review, Assignment, Submission, etc.
│   ├── services/platformService.ts  # Datos mock en memoria (UI aún por migrar a services/)
│   ├── components/AppShell.tsx   # Sidebar 220px + Outlet
│   └── styles/platform.css       # Badges, modales, filtros, upload-zone
└── store/
    ├── authStore.ts              # Usuario activo (Zustand)
    ├── reviewStore.ts            # Revisión activa con mutaciones por etapa
    └── evaluationStore.ts        # Sesión de evaluación legacy
```

---

## Rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/login` | todos | Selección de usuario de prueba |
| `/` | todos | Redirección automática por rol |
| `/estudiante` | student | Gestión de entrega de documento |
| `/evaluador` | evaluator | Lista de estudiantes asignados |
| `/evaluador/revision/:submissionId` | evaluator | Revisión multi-etapa (pantalla completa) |
| `/admin` | admin | Vista general de evaluadores y estudiantes |
| `/admin/asignaciones` | admin | Crear / eliminar asignaciones |
| `/evaluacion` | evaluator | Módulo de evaluación PDF legacy |

---

## Correr localmente

**Requisitos:**
- [Docker](https://www.docker.com/) y Docker Compose
- Node.js 18+

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/ceish-platform.git
cd ceish-platform
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

El `.env` ya trae valores listos para el demo. Por defecto el contenedor se publica
en el host en el puerto **5433** (para no chocar con una instalación local de
PostgreSQL que suele ocupar el 5432). Ajusta `DATABASE_PORT` si lo necesitas.

### 3. Levantar la base de datos (Docker)

```bash
docker compose up -d
```

La primera vez, PostgreSQL ejecuta automáticamente `database/schema.sql` y
`database/seed.sql`, dejando las tablas creadas y con datos de prueba. El volumen
`ceish_postgres_data` conserva los datos aunque ejecutes `docker compose down`.

### 4. Ejecutar el frontend

```bash
npm run dev
# → http://localhost:5173
```

### Comandos

```bash
npm run dev            # Servidor de desarrollo con HMR + rutas /api
npm run build          # Type-check + build de producción
npm run lint           # ESLint
docker compose up -d   # Levantar PostgreSQL
docker compose down    # Detener PostgreSQL (conserva el volumen)
```

### Verificar que los datos llegan desde PostgreSQL

Con la BD levantada y el dev server corriendo, estas rutas devuelven datos reales:

```bash
curl "http://localhost:5173/api/users?role=student"
curl "http://localhost:5173/api/submissions"
curl "http://localhost:5173/api/reviews/d0000000-0000-0000-0000-000000000001"
```

### Usuarios de prueba (seed)

| Nombre | Rol | Email | Contraseña |
|--------|-----|-------|-----------|
| Admin Demo | admin | admin@ceish.edu | demo123 |
| Profesor Demo | teacher | profesor@ceish.edu | demo123 |
| Juan Pérez | student | juan@ceish.edu | demo123 |
| María López | student | maria@ceish.edu | demo123 |
| Carlos Ruiz | student | carlos@ceish.edu | demo123 |

**Datos precargados:** el Profesor Demo tiene 3 estudiantes asignados; Juan tiene
una entrega (`submitted`) con una revisión en curso (etapa 1 completa, etapa 2 en
progreso) que incluye criterios evaluados y una anotación sobre el PDF.

---

## Roadmap

- [x] Base de datos PostgreSQL en Docker con schema y seed
- [x] Capa de acceso a datos (pool `pg` + rutas API + servicios del frontend)
- [ ] Migrar las pantallas para que consuman `src/services/` en vez del mock en memoria
- [ ] Operaciones de escritura (crear/editar entregas y revisiones contra la BD)
- [ ] Autenticación real con JWT
- [ ] Almacenamiento de archivos PDF (Object Storage tipo MinIO/S3)
- [ ] Notificaciones de estado por correo
- [ ] Panel de estadísticas para administrador

---

## Licencia

Uso institucional interno — CEISH.
