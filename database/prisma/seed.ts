/**
 * CEISH Platform - Seed inicial
 *
 * Inserta:
 *  - Usuario administrador por defecto
 *  - Tipos de investigación base
 *  - Plantillas de anexos base (Anexo 12, 23, 27) con su primera versión
 *
 * Ejecutar con:
 *   npx ts-node prisma/seed.ts
 *   o
 *   npm run prisma:seed
 */

import { PrismaClient, UserType, UserAccountStatus, AnnexFieldType } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Utilidad simple para hashear passwords (en producción usar bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🌱 Iniciando seed de la base de datos CEISH...\n");

  // ----------------------------------------------------------
  // 1. Usuario administrador por defecto
  // ----------------------------------------------------------
  console.log("👤 Creando usuario administrador...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@ceish.local" },
    update: {},
    create: {
      name: "Administrador CEISH",
      email: "admin@ceish.local",
      passwordHash: hashPassword("Admin@CEISH2024"),
      userType: UserType.ADMIN,
      accountStatus: UserAccountStatus.ACTIVE,
    },
  });

  console.log(`   ✅ Admin creado: ${admin.email} (id: ${admin.id})`);

  // ----------------------------------------------------------
  // 2. Tipos de investigación
  // ----------------------------------------------------------
  console.log("\n📋 Creando tipos de investigación...");

  const researchTypes = [
    {
      name: "Investigación con seres humanos",
      description:
        "Investigaciones que implican participación directa de seres humanos como sujetos de estudio.",
    },
    {
      name: "Investigación con datos secundarios",
      description:
        "Investigaciones que utilizan datos existentes sin interacción directa con sujetos.",
    },
    {
      name: "Investigación con muestras biológicas",
      description:
        "Investigaciones que utilizan material biológico de origen humano.",
    },
    {
      name: "Investigación de registros médicos",
      description:
        "Investigaciones basadas en revisión de historias clínicas o registros médicos.",
    },
    {
      name: "Investigación epidemiológica",
      description:
        "Estudios sobre la distribución y determinantes de enfermedades en poblaciones.",
    },
    {
      name: "Ensayo clínico",
      description:
        "Evaluación experimental de intervenciones médicas o terapéuticas en seres humanos.",
    },
  ];

  for (const rt of researchTypes) {
    const created = await prisma.researchType.upsert({
      where: { name: rt.name },
      update: {},
      create: rt,
    });
    console.log(`   ✅ Tipo: ${created.name}`);
  }

  // ----------------------------------------------------------
  // 3. Plantillas de anexos con versiones iniciales
  // ----------------------------------------------------------
  console.log("\n📄 Creando plantillas de anexos...");

  // --- Anexo 12: Formulario de solicitud de evaluación ---
  const anexo12Template = await prisma.annexTemplate.upsert({
    where: { name: "Anexo 12" },
    update: {},
    create: {
      name: "Anexo 12",
      description:
        "Formulario de presentación de protocolo de investigación al CEISH",
      isRequired: true,
      isActive: true,
    },
  });

  const anexo12ExistingVersion = await prisma.annexVersion.findFirst({
    where: { annexTemplateId: anexo12Template.id, versionNumber: 1 },
  });

  if (!anexo12ExistingVersion) {
    const anexo12Version = await prisma.annexVersion.create({
      data: {
        annexTemplateId: anexo12Template.id,
        versionNumber: 1,
        description: "Versión inicial del Anexo 12",
        isCurrentVersion: true,
        fields: {
          create: [
            {
              fieldKey: "titulo_investigacion",
              label: "Título de la investigación",
              fieldType: AnnexFieldType.TEXT,
              isRequired: true,
              order: 1,
            },
            {
              fieldKey: "resumen",
              label: "Resumen del protocolo",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: true,
              helpText: "Máximo 500 palabras",
              order: 2,
            },
            {
              fieldKey: "objetivos",
              label: "Objetivos de la investigación",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: true,
              order: 3,
            },
            {
              fieldKey: "metodologia",
              label: "Metodología",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: true,
              order: 4,
            },
            {
              fieldKey: "participantes",
              label: "Descripción de participantes",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: true,
              order: 5,
            },
            {
              fieldKey: "riesgos_beneficios",
              label: "Descripción de riesgos y beneficios",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: true,
              order: 6,
            },
            {
              fieldKey: "consentimiento_informado",
              label: "¿Se obtendrá consentimiento informado?",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 7,
              options: ["Sí", "No", "No aplica"],
            },
            {
              fieldKey: "financiamiento",
              label: "Fuente de financiamiento",
              fieldType: AnnexFieldType.TEXT,
              isRequired: false,
              order: 8,
            },
            {
              fieldKey: "fecha_inicio",
              label: "Fecha de inicio estimada",
              fieldType: AnnexFieldType.DATE,
              isRequired: true,
              order: 9,
            },
            {
              fieldKey: "fecha_fin",
              label: "Fecha de fin estimada",
              fieldType: AnnexFieldType.DATE,
              isRequired: true,
              order: 10,
            },
          ],
        },
      },
    });
    console.log(
      `   ✅ Anexo 12 - Versión ${anexo12Version.versionNumber} creada`
    );
  } else {
    console.log(`   ⏭️  Anexo 12 - Versión 1 ya existe, omitiendo`);
  }

  // --- Anexo 23: Declaración de conflicto de interés ---
  const anexo23Template = await prisma.annexTemplate.upsert({
    where: { name: "Anexo 23" },
    update: {},
    create: {
      name: "Anexo 23",
      description:
        "Declaración de conflicto de interés del evaluador CEISH",
      isRequired: true,
      isActive: true,
    },
  });

  const anexo23ExistingVersion = await prisma.annexVersion.findFirst({
    where: { annexTemplateId: anexo23Template.id, versionNumber: 1 },
  });

  if (!anexo23ExistingVersion) {
    const anexo23Version = await prisma.annexVersion.create({
      data: {
        annexTemplateId: anexo23Template.id,
        versionNumber: 1,
        description: "Versión inicial del Anexo 23",
        isCurrentVersion: true,
        fields: {
          create: [
            {
              fieldKey: "tiene_conflicto",
              label: "¿Declara usted tener conflicto de interés con esta investigación?",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 1,
              options: ["Sí", "No"],
            },
            {
              fieldKey: "tipo_conflicto",
              label: "Tipo de conflicto (si aplica)",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: false,
              order: 2,
              options: [
                "Relación personal con investigador principal",
                "Interés económico",
                "Participación previa en el protocolo",
                "Relación institucional",
                "Otro",
              ],
            },
            {
              fieldKey: "descripcion_conflicto",
              label: "Descripción del conflicto",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: false,
              helpText: "Complete este campo si declaró tener conflicto",
              order: 3,
            },
          ],
        },
      },
    });
    console.log(
      `   ✅ Anexo 23 - Versión ${anexo23Version.versionNumber} creada`
    );
  } else {
    console.log(`   ⏭️  Anexo 23 - Versión 1 ya existe, omitiendo`);
  }

  // --- Anexo 27: Lista de criterios de evaluación ---
  const anexo27Template = await prisma.annexTemplate.upsert({
    where: { name: "Anexo 27" },
    update: {},
    create: {
      name: "Anexo 27",
      description:
        "Lista de criterios de evaluación ética del protocolo de investigación",
      isRequired: true,
      isActive: true,
    },
  });

  const anexo27ExistingVersion = await prisma.annexVersion.findFirst({
    where: { annexTemplateId: anexo27Template.id, versionNumber: 1 },
  });

  if (!anexo27ExistingVersion) {
    const anexo27Version = await prisma.annexVersion.create({
      data: {
        annexTemplateId: anexo27Template.id,
        versionNumber: 1,
        description: "Versión inicial del Anexo 27",
        isCurrentVersion: true,
        fields: {
          create: [
            {
              fieldKey: "criterio_valor_cientifico",
              label: "Valor científico y social del estudio",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 1,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_validez_cientifica",
              label: "Validez científica del protocolo",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 2,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_seleccion_participantes",
              label: "Selección equitativa de participantes",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 3,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_balance_riesgo_beneficio",
              label: "Balance favorable riesgo/beneficio",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 4,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_evaluacion_independiente",
              label: "Revisión independiente del protocolo",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 5,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_consentimiento",
              label: "Consentimiento informado apropiado",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 6,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_respeto_participantes",
              label: "Respeto a los participantes enrolados",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 7,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "criterio_confidencialidad",
              label: "Garantías de confidencialidad y privacidad",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 8,
              options: ["CUMPLE", "NO_CUMPLE", "NO_APLICA"],
            },
            {
              fieldKey: "observaciones_generales",
              label: "Observaciones generales del evaluador",
              fieldType: AnnexFieldType.TEXTAREA,
              isRequired: false,
              order: 9,
            },
            {
              fieldKey: "resultado_evaluacion",
              label: "Resultado de la evaluación",
              fieldType: AnnexFieldType.CHECKLIST,
              isRequired: true,
              order: 10,
              options: [
                "APROBADO",
                "APROBADO_CON_OBSERVACIONES",
                "REQUIERE_CORRECCIONES",
                "RECHAZADO",
              ],
            },
          ],
        },
      },
    });
    console.log(
      `   ✅ Anexo 27 - Versión ${anexo27Version.versionNumber} creada`
    );
  } else {
    console.log(`   ⏭️  Anexo 27 - Versión 1 ya existe, omitiendo`);
  }

  // ----------------------------------------------------------
  // Resumen
  // ----------------------------------------------------------
  console.log("\n✨ Seed completado exitosamente.");
  console.log("\n📊 Resumen:");
  console.log(`   - Usuarios:               ${await prisma.user.count()}`);
  console.log(`   - Tipos de investigación: ${await prisma.researchType.count()}`);
  console.log(`   - Plantillas de anexos:   ${await prisma.annexTemplate.count()}`);
  console.log(`   - Versiones de anexos:    ${await prisma.annexVersion.count()}`);
  console.log(`   - Campos de anexos:       ${await prisma.annexField.count()}`);
  console.log("\n🔑 Credenciales del administrador:");
  console.log("   Email:    admin@ceish.local");
  console.log("   Password: Admin@CEISH2024");
  console.log("   ⚠️  Cambiar la contraseña en producción.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
