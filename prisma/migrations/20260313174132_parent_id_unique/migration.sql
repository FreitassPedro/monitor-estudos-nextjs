/*
  Warnings:

  - A unique constraint covering the columns `[parentId,name]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Topic_subjectId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Topic_parentId_name_key" ON "Topic"("parentId", "name");
