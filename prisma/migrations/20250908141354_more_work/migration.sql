/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Notification_type_idx` ON `Notification`(`type`);
