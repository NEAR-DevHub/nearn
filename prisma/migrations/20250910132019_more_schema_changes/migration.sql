-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `actorId` VARCHAR(191) NULL,
    ADD COLUMN `data` JSON NULL;

-- CreateIndex
CREATE INDEX `Notification_actorId_idx` ON `Notification`(`actorId`);
