-- F-07: retain free text on the answer and store multi-choice selections as
-- rows tied to both the answer's question and the option's question.
ALTER TABLE "Answer"
  ADD COLUMN "text_value" VARCHAR(500),
  ADD CONSTRAINT "Answer_text_value_length_check"
    CHECK ("text_value" IS NULL OR (char_length("text_value") BETWEEN 1 AND 500 AND length(btrim("text_value")) > 0)),
  ADD CONSTRAINT "Answer_value_columns_exclusive_check"
    CHECK (num_nonnulls("rating_value", "optionId", "text_value") <= 1);

CREATE UNIQUE INDEX "QuestionOption_id_questionId_key"
  ON "QuestionOption"("id", "questionId");

CREATE UNIQUE INDEX "Answer_id_questionId_key"
  ON "Answer"("id", "questionId");

CREATE TABLE "AnswerSelectedOption" (
  "answerId" INTEGER NOT NULL,
  "questionId" INTEGER NOT NULL,
  "optionId" INTEGER NOT NULL,
  CONSTRAINT "AnswerSelectedOption_pkey" PRIMARY KEY ("answerId", "optionId"),
  CONSTRAINT "AnswerSelectedOption_answerId_questionId_fkey"
    FOREIGN KEY ("answerId", "questionId") REFERENCES "Answer"("id", "questionId")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AnswerSelectedOption_optionId_questionId_fkey"
    FOREIGN KEY ("optionId", "questionId") REFERENCES "QuestionOption"("id", "questionId")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "AnswerSelectedOption_optionId_questionId_idx"
  ON "AnswerSelectedOption"("optionId", "questionId");
