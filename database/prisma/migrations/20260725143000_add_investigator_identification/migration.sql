ALTER TABLE "investigator_profiles"
  ADD COLUMN "identification_number" TEXT,
  ADD COLUMN "identification_verified_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "investigator_profiles_identification_number_key"
  ON "investigator_profiles"("identification_number");
