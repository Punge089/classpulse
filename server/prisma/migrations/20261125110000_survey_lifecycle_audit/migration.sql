CREATE TYPE "SurveyLifecycleAction" AS ENUM ('PUBLISH', 'CLOSE', 'REOPEN');

ALTER TABLE "Survey" ADD COLUMN "statusVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Survey" ADD CONSTRAINT "survey_status_version_nonnegative" CHECK ("statusVersion" >= 0);

CREATE TABLE "SurveyLifecycleEvent" (
    "id" SERIAL NOT NULL,
    "surveyId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "action" "SurveyLifecycleAction" NOT NULL,
    "fromStatus" "SurveyStatus" NOT NULL,
    "toStatus" "SurveyStatus" NOT NULL,
    "version" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" VARCHAR(300),
    "previousClosedAt" TIMESTAMP(3),
    CONSTRAINT "SurveyLifecycleEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lifecycle_positive_version" CHECK ("version" > 0),
    CONSTRAINT "lifecycle_event_shape" CHECK (
      ("action" = 'PUBLISH' AND "fromStatus" = 'DRAFT' AND "toStatus" = 'PUBLISHED' AND "reason" IS NULL AND "previousClosedAt" IS NULL)
      OR ("action" = 'CLOSE' AND "fromStatus" = 'PUBLISHED' AND "toStatus" = 'CLOSED' AND "reason" IS NULL AND "previousClosedAt" IS NULL)
      OR ("action" = 'REOPEN' AND "fromStatus" = 'CLOSED' AND "toStatus" = 'PUBLISHED' AND "reason" IS NOT NULL AND char_length("reason") BETWEEN 1 AND 300 AND "reason" = btrim("reason"))
    )
);

CREATE UNIQUE INDEX "SurveyLifecycleEvent_surveyId_version_key" ON "SurveyLifecycleEvent"("surveyId", "version");
CREATE INDEX "SurveyLifecycleEvent_surveyId_id_idx" ON "SurveyLifecycleEvent"("surveyId", "id");
ALTER TABLE "SurveyLifecycleEvent" ADD CONSTRAINT "SurveyLifecycleEvent_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SurveyLifecycleEvent" ADD CONSTRAINT "SurveyLifecycleEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
