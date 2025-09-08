-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `sponsorId` VARCHAR(191) NULL,
    MODIFY `eventId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Notification_sponsorId_idx` ON `Notification`(`sponsorId`);
