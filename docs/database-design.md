# Diseño de base de datos — CEISH Platform

Base de datos relacional PostgreSQL. Toda la lógica de negocio que hoy vive en `platformService.ts` (mock en memoria) se mapea directamente a estas tablas.

---

## Plan de implementación

1. Levantar PostgreSQL en Docker con `docker-compose.yml`
2. Crear las tablas con las migraciones (en orden: users → submissions → assignments → reviews → review_stages → criteria_evaluations)
3. Reemplazar `platformService.ts` con llamadas HTTP al backend — las interfaces TypeScript ya existentes no cambian
4. Implementar autenticación JWT (tabla `users` ya tiene `password_hash`)

---

## Tablas

### `users`

Usuarios del sistema. Un usuario tiene exactamente un rol.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL CHECK (role IN ('student', 'evaluator', 'admin')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### `submissions`

Documento que un estudiante sube para evaluación. Un estudiante puede tener **como máximo una entrega activa** (la restricción de unicidad por `student_id` se implementa en la capa de negocio o con un índice parcial).

```sql
CREATE TABLE submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_name  VARCHAR(255)  NOT NULL,
  document_url   TEXT          NOT NULL,        -- ruta en almacenamiento (S3 / volumen Docker)
  comment        TEXT          NOT NULL DEFAULT '',
  status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'under-review', 'reviewed')),
  grade          NUMERIC(4,2)  CHECK (grade >= 0 AND grade <= 10),
  final_comment  TEXT,                          -- retroalimentación anónima para el estudiante
  submitted_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);

-- Un estudiante solo puede tener una entrega a la vez
CREATE UNIQUE INDEX submissions_student_unique ON submissions(student_id);
```

**Campos clave:**
- `document_url` — apunta al archivo almacenado (no al binario en BD)
- `final_comment` — se muestra al estudiante sin revelar quién evaluó
- `status` se actualiza automáticamente cuando la revisión se completa

---

### `assignments`

Relación evaluador–estudiante creada por el administrador. Un estudiante puede estar asignado a varios evaluadores y viceversa, pero la combinación evaluador+estudiante es única.

```sql
CREATE TABLE assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT assignments_unique UNIQUE (evaluator_id, student_id),
  CONSTRAINT evaluator_must_be_evaluator CHECK (evaluator_id <> student_id)
);
```

---

### `reviews`

Proceso de revisión de una entrega. Una entrega puede tener una sola revisión (al menos en la versión actual). Relaciona la entrega con el evaluador que la revisa.

```sql
CREATE TABLE reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id       UUID          NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  evaluator_id        UUID          NOT NULL REFERENCES users(id),
  student_id          UUID          NOT NULL REFERENCES users(id),
  current_stage_index SMALLINT      NOT NULL DEFAULT 0,
  grade               NUMERIC(4,2)  CHECK (grade >= 0 AND grade <= 10),
  final_comment       TEXT,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT reviews_submission_unique UNIQUE (submission_id)
);
```

**Nota:** `student_id` se denormaliza aquí para simplificar queries frecuentes (listar revisiones por evaluador sin hacer join a submissions).

---

### `review_stages`

Las 4 etapas fijas de cada revisión (Estructura, Metodología, Resultados, Formato). Se crean automáticamente al crear una revisión.

```sql
CREATE TABLE review_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID         NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  name        VARCHAR(80)  NOT NULL,
  stage_order SMALLINT     NOT NULL,      -- 1, 2, 3, 4
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in-progress', 'completed')),

  CONSTRAINT review_stages_order_unique UNIQUE (review_id, stage_order)
);
```

---

### `criteria_evaluations`

Resultado de cada criterio dentro de una etapa. Los criterios no son libres — corresponden a una plantilla fija por etapa (ver `stage_criteria_templates`).

```sql
CREATE TABLE criteria_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id        UUID          NOT NULL REFERENCES review_stages(id) ON DELETE CASCADE,
  criterion_key   VARCHAR(40)   NOT NULL,   -- ej. 's1-c1', mapea a la plantilla
  label           TEXT          NOT NULL,   -- copia del label en el momento de la revisión
  status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  observation     TEXT          NOT NULL DEFAULT '',
  page_reference  SMALLINT,                 -- página del PDF referenciada
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT criteria_eval_unique UNIQUE (stage_id, criterion_key)
);
```

**Por qué copiar `label`:** si la plantilla de criterios cambia en el futuro, los registros históricos conservan el texto con el que fueron evaluados.

---

### `stage_criteria_templates` _(tabla de referencia)_

Define los criterios que componen cada etapa. Es estática y no cambia en producción. Permite agregar o modificar criterios sin tocar código.

```sql
CREATE TABLE stage_criteria_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name   VARCHAR(80)  NOT NULL,   -- 'Estructura', 'Metodología', etc.
  stage_order  SMALLINT     NOT NULL,
  criterion_key VARCHAR(40) NOT NULL UNIQUE,
  label        TEXT         NOT NULL,
  category     VARCHAR(80),
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE
);
```

**Datos iniciales:**

| stage_order | stage_name | criterion_key | label |
|-------------|------------|---------------|-------|
| 1 | Estructura | s1-c1 | El documento contiene una introducción clara |
| 1 | Estructura | s1-c2 | Los objetivos están claramente definidos |
| 1 | Estructura | s1-c3 | La hipótesis o pregunta de investigación está planteada |
| 2 | Metodología | s2-c1 | La metodología es apropiada para el tipo de investigación |
| 2 | Metodología | s2-c2 | La población de estudio está correctamente definida |
| 2 | Metodología | s2-c3 | Los instrumentos de recolección están descritos |
| 3 | Resultados | s3-c1 | Los resultados se presentan de forma clara y ordenada |
| 3 | Resultados | s3-c2 | El análisis estadístico es correcto y justificado |
| 3 | Resultados | s3-c3 | Las conclusiones responden a los objetivos planteados |
| 4 | Formato | s4-c1 | Las referencias bibliográficas están en formato APA |
| 4 | Formato | s4-c2 | El documento cumple con los criterios de extensión mínima |

---

## Diagrama de relaciones

```
users ──────────────────────────────────────────────────────────────────┐
  │ (role=student)                                                       │ (role=evaluator)
  │ 1                                                                    │ 1
  ▼ N                                                                    ▼ N
submissions                         assignments ◄──── users (role=admin crea)
  │ 1                                  │
  │                              evaluator_id / student_id
  ▼ 1
reviews
  │ 1
  ▼ N
review_stages
  │ 1
  ▼ N
criteria_evaluations


stage_criteria_templates  (referencia estática, sin FK a reviews)
```

---

## Flujo de estados

### `submissions.status`

```
pending  ──► under-review  ──► reviewed
  ▲               │
  └─ (si se elimina la revisión, vuelve a pending)
```

- `pending` → el estudiante subió el documento, aún sin evaluador activo
- `under-review` → el evaluador abrió la revisión (se crea el registro en `reviews`)
- `reviewed` → la revisión se completó (`reviews.completed_at` tiene valor)

### `review_stages.status`

```
pending  ──► in-progress  ──► completed
```

- Solo puede haber una etapa `in-progress` a la vez por revisión
- El avance es secuencial (no se puede saltar etapas)

---

## Consideraciones de implementación

### Trigger para `updated_at`
Crear una función PostgreSQL que actualice `updated_at` automáticamente en `users`, `reviews` y `criteria_evaluations`:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a cada tabla que tenga updated_at
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Índices recomendados

```sql
-- Consultas frecuentes del evaluador
CREATE INDEX idx_assignments_evaluator ON assignments(evaluator_id);
CREATE INDEX idx_reviews_evaluator     ON reviews(evaluator_id);
CREATE INDEX idx_review_stages_review  ON review_stages(review_id);
CREATE INDEX idx_criteria_stage        ON criteria_evaluations(stage_id);

-- Consulta del estudiante
CREATE INDEX idx_submissions_student   ON submissions(student_id);
```

### Almacenamiento de archivos PDF

Los PDF **no se guardan en la base de datos**. `submissions.document_url` apunta a:
- Desarrollo: volumen Docker montado en `/uploads/`
- Producción: bucket S3 o equivalente

El backend recibe el archivo vía `multipart/form-data`, lo guarda en el sistema de archivos / object storage y almacena solo la URL en la BD.

---

## docker-compose.yml (referencia)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ceish_db
      POSTGRES_USER: ceish_user
      POSTGRES_PASSWORD: ceish_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://ceish_user:ceish_pass@db:5432/ceish_db
      JWT_SECRET: change_in_production
    ports:
      - "3000:3000"
    depends_on:
      - db

  frontend:
    build: .
    ports:
      - "5173:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

---

## Orden de creación de tablas (migraciones)

```
1. users
2. submissions          (FK → users)
3. assignments          (FK → users x2)
4. stage_criteria_templates   (sin FK externas)
5. reviews              (FK → submissions, users x2)
6. review_stages        (FK → reviews)
7. criteria_evaluations (FK → review_stages)
```
