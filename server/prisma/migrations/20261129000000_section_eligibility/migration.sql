-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "sectionId" INTEGER;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "sectionIdAtSubmission" INTEGER;

-- CreateTable
CREATE TABLE "CourseSection" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveySection" (
    "surveyId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "SurveySection_pkey" PRIMARY KEY ("surveyId","sectionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseSection_courseId_code_key" ON "CourseSection"("courseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSection_id_courseId_key" ON "CourseSection"("id", "courseId");

-- CreateIndex
CREATE INDEX "SurveySection_sectionId_courseId_idx" ON "SurveySection"("sectionId", "courseId");

-- CreateIndex
CREATE INDEX "Enrollment_sectionId_courseId_idx" ON "Enrollment"("sectionId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_id_courseId_key" ON "Survey"("id", "courseId");

-- CreateIndex
CREATE INDEX "Response_sectionIdAtSubmission_idx" ON "Response"("sectionIdAtSubmission");

-- AddForeignKey
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sectionId_courseId_fkey" FOREIGN KEY ("sectionId", "courseId") REFERENCES "CourseSection"("id", "courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveySection" ADD CONSTRAINT "SurveySection_surveyId_courseId_fkey" FOREIGN KEY ("surveyId", "courseId") REFERENCES "Survey"("id", "courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveySection" ADD CONSTRAINT "SurveySection_sectionId_courseId_fkey" FOREIGN KEY ("sectionId", "courseId") REFERENCES "CourseSection"("id", "courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_sectionIdAtSubmission_fkey" FOREIGN KEY ("sectionIdAtSubmission") REFERENCES "CourseSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
