-- ============================================================
-- CEISH Platform - Extensiones de PostgreSQL
-- Se ejecuta automáticamente al inicializar el contenedor
-- ============================================================

-- UUID nativo (necesario para gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Para búsquedas de texto completo en español
CREATE EXTENSION IF NOT EXISTS "unaccent";
