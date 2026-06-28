-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('INVESTIGATOR', 'CEISH_MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InvestigatorType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "CeishMemberType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('CREATED', 'PENDING_ADMIN_REVIEW', 'REJECTED', 'APPROVED', 'WAITING_STRATIFICATION', 'STRATIFICATION', 'RISK_DEFINED', 'ADMIN_RISK_REVIEW', 'RESTRATIFICATION', 'WAITING_EVALUATORS', 'WAITING_CONFLICT_CHECK', 'UNDER_EVALUATION', 'WAITING_RESEARCHER_RESPONSE', 'FINAL_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NO_RISK', 'MINIMUM_RISK', 'GREATER_THAN_MINIMUM_RISK');

-- CreateEnum
CREATE TYPE "RiskAssessmentStatus" AS ENUM ('ACTIVE', 'REPLACED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EvaluationAssignmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'CONFLICT', 'REMOVED', 'FINISHED');

-- CreateEnum
CREATE TYPE "EvaluationProcessStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'OBSERVATIONS_FOUND', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'OBSERVATIONS_FOUND', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CorrectionRoundStatus" AS ENUM ('OPEN', 'SUBMITTED', 'EXPIRED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AnnexFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'CHECKLIST', 'DATE', 'NUMERIC', 'FILE_UPLOAD');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ANNEX_UPLOAD', 'CONFLICT_DECLARATION', 'CORRECTION_RESPONSE', 'EVALUATION_EVIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkflowEventType" AS ENUM ('USER_REGISTERED', 'USER_APPROVED', 'USER_REJECTED', 'INVESTIGATION_CREATED', 'INVESTIGATION_SUBMITTED', 'INVESTIGATION_APPROVED', 'INVESTIGATION_REJECTED', 'STRATIFICATION_CREATED', 'STRATIFICATION_REPLACED', 'STRATIFICATION_COMPLETED', 'RISK_DEFINED', 'EVALUATOR_ASSIGNED', 'CONFLICT_DECLARED', 'EVALUATOR_REMOVED', 'EVALUATION_STARTED', 'EVALUATION_COMPLETED', 'OBSERVATION_ADDED', 'CORRECTION_ROUND_OPENED', 'CORRECTION_SUBMITTED', 'CORRECTION_APPROVED', 'CORRECTION_REJECTED', 'INVESTIGATION_COMPLETED', 'INVESTIGATION_CANCELLED', 'ADMIN_ACTION', 'REESTRATIFICATION_REQUESTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "account_status" "UserAccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigator_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "investigator_type" "InvestigatorType" NOT NULL,
    "institution" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ceish_member_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "member_type" "CeishMemberType" NOT NULL,
    "specialization" TEXT,
    "institution" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ceish_member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigations" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InvestigationStatus" NOT NULL DEFAULT 'CREATED',
    "research_type_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_participants" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identification" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "institution" TEXT,
    "is_principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annex_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annex_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annex_versions" (
    "id" TEXT NOT NULL,
    "annex_template_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "description" TEXT,
    "is_current_version" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annex_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annex_fields" (
    "id" TEXT NOT NULL,
    "annex_version_id" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" "AnnexFieldType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "help_text" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annex_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_annexes" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "annex_version_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_annexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annex_answers" (
    "id" TEXT NOT NULL,
    "investigation_annex_id" TEXT NOT NULL,
    "annex_field_id" TEXT NOT NULL,
    "value" TEXT,
    "json_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annex_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "status" "RiskAssessmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "risk_level" "RiskLevel",
    "justification" TEXT,
    "created_by_id" TEXT NOT NULL,
    "replaced_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessment_members" (
    "id" TEXT NOT NULL,
    "risk_assessment_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessment_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_processes" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "risk_assessment_id" TEXT NOT NULL,
    "status" "EvaluationProcessStatus" NOT NULL DEFAULT 'CREATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_assignments" (
    "id" TEXT NOT NULL,
    "evaluation_process_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "status" "EvaluationAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3),
    "removal_reason" TEXT,

    CONSTRAINT "evaluation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conflict_declarations" (
    "id" TEXT NOT NULL,
    "evaluation_assignment_id" TEXT NOT NULL,
    "has_conflict" BOOLEAN NOT NULL,
    "reason" TEXT,
    "declared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conflict_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "evaluation_process_id" TEXT NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'CREATED',
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_criteria_responses" (
    "id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_criteria_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observations" (
    "id" TEXT NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "section" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observation_responses" (
    "id" TEXT NOT NULL,
    "observation_id" TEXT NOT NULL,
    "correction_round" INTEGER NOT NULL,
    "response" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observation_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction_rounds" (
    "id" TEXT NOT NULL,
    "evaluation_process_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "status" "CorrectionRoundStatus" NOT NULL DEFAULT 'OPEN',
    "deadline" TIMESTAMP(3) NOT NULL,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "correction_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigation_id" TEXT,
    "correction_round_id" TEXT,
    "conflict_declaration_id" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_events" (
    "id" TEXT NOT NULL,
    "event_type" "WorkflowEventType" NOT NULL,
    "actor_id" TEXT,
    "investigation_id" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "previous_status" TEXT,
    "new_status" TEXT,
    "metadata" JSONB,
    "description" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "investigator_profiles_user_id_key" ON "investigator_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ceish_member_profiles_user_id_key" ON "ceish_member_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_types_name_key" ON "research_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "investigations_code_key" ON "investigations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "annex_templates_name_key" ON "annex_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "annex_versions_annex_template_id_version_number_key" ON "annex_versions"("annex_template_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "annex_fields_annex_version_id_field_key_key" ON "annex_fields"("annex_version_id", "field_key");

-- CreateIndex
CREATE UNIQUE INDEX "investigation_annexes_investigation_id_annex_version_id_key" ON "investigation_annexes"("investigation_id", "annex_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "annex_answers_investigation_annex_id_annex_field_id_key" ON "annex_answers"("investigation_annex_id", "annex_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "risk_assessment_members_risk_assessment_id_member_id_key" ON "risk_assessment_members"("risk_assessment_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_processes_investigation_id_key" ON "evaluation_processes"("investigation_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_processes_risk_assessment_id_key" ON "evaluation_processes"("risk_assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_criteria_responses_evaluation_id_criterion_key_key" ON "evaluation_criteria_responses"("evaluation_id", "criterion_key");

-- CreateIndex
CREATE UNIQUE INDEX "correction_rounds_evaluation_process_id_round_number_key" ON "correction_rounds"("evaluation_process_id", "round_number");

-- CreateIndex
CREATE UNIQUE INDEX "documents_correction_round_id_key" ON "documents"("correction_round_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_conflict_declaration_id_key" ON "documents"("conflict_declaration_id");

-- AddForeignKey
ALTER TABLE "investigator_profiles" ADD CONSTRAINT "investigator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ceish_member_profiles" ADD CONSTRAINT "ceish_member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_research_type_id_fkey" FOREIGN KEY ("research_type_id") REFERENCES "research_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_participants" ADD CONSTRAINT "investigation_participants_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annex_versions" ADD CONSTRAINT "annex_versions_annex_template_id_fkey" FOREIGN KEY ("annex_template_id") REFERENCES "annex_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annex_fields" ADD CONSTRAINT "annex_fields_annex_version_id_fkey" FOREIGN KEY ("annex_version_id") REFERENCES "annex_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_annexes" ADD CONSTRAINT "investigation_annexes_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigation_annexes" ADD CONSTRAINT "investigation_annexes_annex_version_id_fkey" FOREIGN KEY ("annex_version_id") REFERENCES "annex_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annex_answers" ADD CONSTRAINT "annex_answers_investigation_annex_id_fkey" FOREIGN KEY ("investigation_annex_id") REFERENCES "investigation_annexes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annex_answers" ADD CONSTRAINT "annex_answers_annex_field_id_fkey" FOREIGN KEY ("annex_field_id") REFERENCES "annex_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessment_members" ADD CONSTRAINT "risk_assessment_members_risk_assessment_id_fkey" FOREIGN KEY ("risk_assessment_id") REFERENCES "risk_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessment_members" ADD CONSTRAINT "risk_assessment_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_processes" ADD CONSTRAINT "evaluation_processes_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_processes" ADD CONSTRAINT "evaluation_processes_risk_assessment_id_fkey" FOREIGN KEY ("risk_assessment_id") REFERENCES "risk_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_evaluation_process_id_fkey" FOREIGN KEY ("evaluation_process_id") REFERENCES "evaluation_processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflict_declarations" ADD CONSTRAINT "conflict_declarations_evaluation_assignment_id_fkey" FOREIGN KEY ("evaluation_assignment_id") REFERENCES "evaluation_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluation_process_id_fkey" FOREIGN KEY ("evaluation_process_id") REFERENCES "evaluation_processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_criteria_responses" ADD CONSTRAINT "evaluation_criteria_responses_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observation_responses" ADD CONSTRAINT "observation_responses_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "observations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_rounds" ADD CONSTRAINT "correction_rounds_evaluation_process_id_fkey" FOREIGN KEY ("evaluation_process_id") REFERENCES "evaluation_processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_correction_round_id_fkey" FOREIGN KEY ("correction_round_id") REFERENCES "correction_rounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_conflict_declaration_id_fkey" FOREIGN KEY ("conflict_declaration_id") REFERENCES "conflict_declarations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
