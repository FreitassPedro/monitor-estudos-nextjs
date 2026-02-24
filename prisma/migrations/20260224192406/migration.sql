/*
  Warnings:

  - Added the required column `topicId` to the `StudyLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudyLogs" ADD COLUMN     "topicId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudyLogs" ADD CONSTRAINT "StudyLogs_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
