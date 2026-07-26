import 'reflect-metadata';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const UserType = { INVESTIGATOR: 'INVESTIGATOR', CEISH_MEMBER: 'CEISH_MEMBER', ADMIN: 'ADMIN' } as const;
const InvestigatorType = { INTERNAL: 'INTERNAL', EXTERNAL: 'EXTERNAL' } as const;
const CeishMemberType = { INTERNAL: 'INTERNAL', EXTERNAL: 'EXTERNAL' } as const;

let prisma: PrismaClient | undefined;

type AnnexFieldSeed = {
  fieldKey: string;
  label: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'CHECKLIST' | 'DATE';
  isRequired: boolean;
  options?: string[];
};

async function seedAnnex(
  name: string,
  description: string,
  fields: AnnexFieldSeed[],
) {
  await prisma!.$transaction(async (tx) => {
    const template = await tx.annexTemplate.upsert({
      where: { name },
      update: { description, isRequired: true, isActive: true },
      create: { name, description, isRequired: true, isActive: true },
    });
    const version = await tx.annexVersion.upsert({
      where: { annexTemplateId_versionNumber: { annexTemplateId: template.id, versionNumber: 1 } },
      update: { isCurrentVersion: true, description },
      create: { annexTemplateId: template.id, versionNumber: 1, description, isCurrentVersion: true },
    });
    const existingFields = await tx.annexField.count({ where: { annexVersionId: version.id } });
    if (existingFields === 0) {
      await tx.annexField.createMany({
        data: fields.map((field, order) => ({
          annexVersionId: version.id,
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          order: order + 1,
          options: field.options,
        })),
      });
    }
  });
}

async function main() {
  console.log('Starting seed...');
  prisma = new PrismaClient();
  await prisma.$connect();

  const adminPassword = await bcrypt.hash('Admin@CEISH2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ceish.local' },
    update: { name: 'Administrador del Sistema', passwordHash: adminPassword, userType: UserType.ADMIN as never, accountStatus: 'ACTIVE' as never },
    create: { name: 'Administrador del Sistema', email: 'admin@ceish.local', passwordHash: adminPassword, userType: UserType.ADMIN as never, accountStatus: 'ACTIVE' as never },
  });

  const members = [
    ['ceish_member_1@ceish.local', 'Member@CEISH2024', 'Bioética', CeishMemberType.INTERNAL],
    ['ceish_member_2@ceish.local', 'Member2@CEISH2024', 'Metodología', CeishMemberType.INTERNAL],
    ['ceish_member_3@ceish.local', 'Member3@CEISH2024', 'Epidemiología', CeishMemberType.EXTERNAL],
  ] as const;
  for (const [email, password, specialization, memberType] of members) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, userType: UserType.CEISH_MEMBER as never, accountStatus: 'ACTIVE' as never },
      create: { name: email.split('@')[0], email, passwordHash, userType: UserType.CEISH_MEMBER as never, accountStatus: 'ACTIVE' as never },
    });
    await prisma.ceishMemberProfile.upsert({
      where: { userId: user.id },
      update: { memberType: memberType as never, specialization },
      create: { userId: user.id, memberType: memberType as never, specialization },
    });
  }

  const investigators = [
    ['investigator_1@ceish.local', 'Invest@CEISH2024', 'Universidad Nacional de Loja', InvestigatorType.INTERNAL, '0100000009'],
    ['investigator_2@ceish.local', 'Invest2@CEISH2024', 'Hospital Regional', InvestigatorType.EXTERNAL, '0900000001'],
  ] as const;
  for (const [email, password, institution, investigatorType, identificationNumber] of investigators) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, userType: UserType.INVESTIGATOR as never, accountStatus: 'ACTIVE' as never },
      create: { name: email.split('@')[0], email, passwordHash, userType: UserType.INVESTIGATOR as never, accountStatus: 'ACTIVE' as never },
    });
    await prisma.investigatorProfile.upsert({
      where: { userId: user.id },
      update: { investigatorType: investigatorType as never, institution, identificationNumber, identificationVerifiedAt: new Date() },
      create: { userId: user.id, investigatorType: investigatorType as never, institution, identificationNumber, identificationVerifiedAt: new Date() },
    });
  }

  await prisma.researchType.createMany({
    data: ['Ensayo Clínico', 'Estudio Observacional', 'Investigación con muestras biológicas', 'Investigación con datos personales', 'Estudio comunitario', 'Proyecto de extensión'].map((name) => ({ name })),
    skipDuplicates: true,
  });

  await seedAnnex('Anexo 12', 'Checklist de evaluación de criterios', [
    { fieldKey: 'cumplimiento_etico', label: 'Cumplimiento ético', fieldType: 'CHECKLIST', isRequired: true, options: ['Cumple', 'No cumple'] },
    { fieldKey: 'consentimiento_informado', label: 'Consentimiento informado', fieldType: 'CHECKLIST', isRequired: true, options: ['Cumple', 'No cumple'] },
    { fieldKey: 'manejo_datos', label: 'Manejo de datos', fieldType: 'CHECKLIST', isRequired: true, options: ['Cumple', 'No cumple'] },
  ]);
  await seedAnnex('Anexo 23', 'Carta de declaración de conflicto', [
    { fieldKey: 'tiene_conflicto', label: '¿Tiene conflicto de interés?', fieldType: 'CHECKLIST', isRequired: true, options: ['Sí', 'No'] },
    { fieldKey: 'tipo_conflicto', label: 'Tipo de conflicto', fieldType: 'TEXT', isRequired: false },
    { fieldKey: 'declaracion', label: 'Declaración', fieldType: 'TEXTAREA', isRequired: true },
  ]);
  await seedAnnex('Anexo 27', 'Documento de confirmación del nivel de riesgo', [
    { fieldKey: 'nivel_riesgo', label: 'Nivel de riesgo', fieldType: 'CHECKLIST', isRequired: true, options: ['Sin riesgo', 'Riesgo mínimo', 'Mayor al riesgo mínimo'] },
    { fieldKey: 'confirmacion', label: 'Confirmación', fieldType: 'CHECKLIST', isRequired: true, options: ['Sí', 'No'] },
    { fieldKey: 'fecha_confirmacion', label: 'Fecha de confirmación', fieldType: 'DATE', isRequired: true },
  ]);

  console.log('Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
