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
| Datos | Mock en memoria — sin backend aún |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── router/index.tsx          # Rutas y redirección por rol (RootRedirect)
│   └── providers/AppProviders.tsx
├── features/
│   ├── auth/                     # Login con selección de usuario simulada
│   ├── evaluation/               # Módulo de evaluación PDF standalone (legacy)
│   ├── student/                  # Vista de entrega de documento
│   ├── evaluator/                # Dashboard + flujo de revisión multi-etapa
│   └── admin/                    # Panel de administración y asignaciones
├── shared/
│   ├── types/platform.types.ts   # User, Review, Assignment, Submission, etc.
│   ├── services/platformService.ts  # Base de datos mock (swap por API aquí)
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

**Requisitos:** Node.js 18+

```bash
git clone https://github.com/tu-usuario/ceish-platform.git
cd ceish-platform
npm install
npm run dev
# → http://localhost:5173
```

### Comandos

```bash
npm run dev       # Servidor de desarrollo con HMR
npm run build     # Type-check + build de producción
npm run lint      # ESLint
npx tsc --noEmit  # Solo verificación de tipos
```

### Usuarios de prueba

Al abrir `/login` se muestran 6 usuarios listos para usar sin contraseña:

| Nombre | Rol | Email |
|--------|-----|-------|
| Admin CEISH | Administrador | admin@ceish.edu |
| Prof. García | Evaluador | garcia@ceish.edu |
| Prof. Martínez | Evaluador | martinez@ceish.edu |
| Juan Pérez | Estudiante | juan@ceish.edu |
| María López | Estudiante | maria@ceish.edu |
| Carlos Ruiz | Estudiante | carlos@ceish.edu |

**Datos precargados:** Juan tiene una entrega revisada (nota 8.5), María tiene una entrega en revisión (etapa 2 de 4), Carlos no tiene entrega.

---

## Roadmap

- [ ] Backend REST con Node.js + Express / Fastify
- [ ] Base de datos PostgreSQL en Docker
- [ ] Autenticación real con JWT y refresh tokens
- [ ] Almacenamiento de archivos PDF (volumen Docker o S3)
- [ ] Notificaciones de estado por correo
- [ ] Panel de estadísticas para administrador
- [ ] Anotaciones sobre el PDF vinculadas a criterios

---

## Licencia

Uso institucional interno — CEISH.
