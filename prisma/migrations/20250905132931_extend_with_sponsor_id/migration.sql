-- AlterTable
ALTER TABLE `NotificationSettings` ADD COLUMN `sponsorId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `NotificationSettings_sponsorId_idx` ON `NotificationSettings`(`sponsorId`);
